import { createClientComponentSupabaseClient } from "@/lib/supabase"

// Fetch backup CSV from Supabase Storage
export async function getContextBackupCSV(context: any): Promise<string | null> {
  const supabase = createClientComponentSupabaseClient()
	const { data: schoolData, error: schoolError } = await supabase
		.from("schools")
		.select("slug")
		.eq("id", context.school_id)
		.single()
	if (schoolError || !schoolData) return null
	context.school_slug = schoolData.slug
  const path = `${context.school_slug}/${context.year}/t${context.term}/grade_${context.grade}.csv`
  const { data, error } = await supabase.storage.from("student-results-csv-backups").download(path)
  if (error || !data) return null
  return await data.text()
}

// Fetch exported CSV by calling the export RPC and formatting as CSV
export async function getContextExportCSV(context: any): Promise<string | null> {
  const supabase = createClientComponentSupabaseClient()
	const { data: contextData, error: contextError } = await supabase
		.from("academic_contexts")
		.select("id")
		.eq("school_id", context.school_id)
		.eq("year", context.year)
		.eq("term", context.term)
		.eq("grade", context.grade)
		.single()
	if (contextError || !contextData) return null
	context.id = contextData.id
  const { data, error } = await supabase.rpc("get_context_students_and_subjects", { input_context_id: context.id })
  if (error || !data) return null
  const students = data.students as any[]
  const subjects: { subject: string, full_mark: number }[] = data.subjects || []
  const headers = ["id", "student_name", "parent_password", ...subjects.map(s => s.subject)]
  const fullMarksRow = ["", "", "", ...subjects.map(s => s.full_mark ?? "")]
  const rows = students.map((student) => {
    const scoreMap: Record<string, any> = {}
    for (const s of student.scores) {
      scoreMap[s.subject] = s
    }
    return [
      student.student_id,
      student.student_name,
      student.parent_password ?? "",
      ...subjects.map(({ subject }) => {
        const scoreObj = scoreMap[subject]
        if (!scoreObj) return "N/A"
        if (scoreObj.absent) return "-"
        return scoreObj.score ?? ""
      }),
    ]
  })
  const csvData = [headers, fullMarksRow, ...rows]
  // Use Papa.unparse if available, else fallback to manual
  try {
    const Papa = (await import("papaparse")).default
    return Papa.unparse(csvData)
  } catch {
    return csvData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
  }
}

// Diff two student CSVs (parsed as arrays of arrays)
export function diffStudentCSVs(backup: string[][], exported: string[][]) {
  // Assume both have headers and full marks row, then student rows
  const headers = backup[0]
  const studentRowsBackup = backup.slice(2)
  const studentRowsExport = exported.slice(2)
  const keyIdx = {
    id: headers.findIndex(h => h.toLowerCase() === "id"),
    name: headers.findIndex(h => h.toLowerCase() === "student_name"),
    pw: headers.findIndex(h => h.toLowerCase() === "parent_password"),
  }
  // Map by student_id for fast lookup
  const backupMap = Object.fromEntries(studentRowsBackup.map(r => [r[keyIdx.id], r]))
  const exportMap = Object.fromEntries(studentRowsExport.map(r => [r[keyIdx.id], r]))
  const allIds = new Set([...Object.keys(backupMap), ...Object.keys(exportMap)])
  const diffs: any[] = []
  for (const id of allIds) {
    const b = backupMap[id]
    const e = exportMap[id]
    if (b && !e) {
      diffs.push({ _diffType: "removed", ...rowToObj(headers, b) })
    } else if (!b && e) {
      diffs.push({ _diffType: "added", ...rowToObj(headers, e) })
    } else if (b && e) {
      // Compare fields
      const diffRow: any = { _diffType: "unchanged" }
      let changed = false
      headers.forEach((h, idx) => {
        if (b[idx] !== e[idx]) {
          diffRow[h] = { old: b[idx], new: e[idx] }
          changed = true
        } else {
          diffRow[h] = b[idx]
        }
      })
      if (changed) {
        diffRow._diffType = "changed"
        diffs.push(diffRow)
      }
    }
  }
  return diffs
}

function rowToObj(headers: string[], row: string[]) {
  const obj: any = {}
  headers.forEach((h, i) => { obj[h] = row[i] })
  return obj
}
