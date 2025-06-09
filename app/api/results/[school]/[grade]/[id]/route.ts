import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { school: string; grade: string; id: string } }) {
  try {
    const { school, grade, id: studentId } = params
    const { searchParams } = new URL(request.url)
    const providedPassword = searchParams.get("password")

    // Validate basic parameters
    const validSchools = ["international", "modern"]
    const gradeNum = Number.parseInt(grade)

    if (!validSchools.includes(school) || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return NextResponse.json({ error: "Invalid school or grade" }, { status: 400 })
    }

    // Try Supabase first
    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Get school
      const { data: schoolData } = await supabase.from("schools").select("id").eq("slug", school).maybeSingle()

      if (schoolData) {
        // Get active context for this school/grade
        const { data: contextData } = await supabase
          .from("academic_contexts")
          .select("id")
          .eq("school_id", schoolData.id)
          .eq("grade", gradeNum)
          .eq("is_active", true)
          .maybeSingle()

        if (contextData) {
          // Get student results
          const { data: studentData } = await supabase
            .from("student_results")
            .select("*")
            .eq("context_id", contextData.id)
            .eq("student_id", studentId)
            .maybeSingle()

          if (studentData) {
            // Check parent password if required
            const requiresPassword = studentData.parent_password && studentData.parent_password.trim() !== ""

            if (requiresPassword) {
              if (!providedPassword) {
                return NextResponse.json(
                  {
                    error: "Parent password required",
                    requiresPassword: true,
                  },
                  { status: 401 },
                )
              }

              if (providedPassword !== studentData.parent_password) {
                return NextResponse.json(
                  {
                    error: "Incorrect parent password",
                    requiresPassword: true,
                  },
                  { status: 401 },
                )
              }
            }

            // Convert Supabase format to expected format
            const subjects: { [key: string]: { score: number | null; fullMark: number; isAbsent: boolean } } = {}

            if (studentData.scores && typeof studentData.scores === "object") {
              Object.entries(studentData.scores as any).forEach(([subjectName, subjectData]: [string, any]) => {
                subjects[subjectName] = {
                  score: subjectData.absent ? null : subjectData.score,
                  fullMark: subjectData.full_mark || 100,
                  isAbsent: subjectData.absent || false,
                }
              })
            }

            return NextResponse.json({
              id: studentData.student_id,
              name: studentData.student_name,
              subjects,
              school,
              grade: gradeNum,
              requiresPassword: false,
            })
          }
        }
      }
    } catch (supabaseError) {
      console.log("Supabase query failed, falling back to CSV:", supabaseError)
    }

    // Fall back to CSV files
    const csvPath = path.join(process.cwd(), "data", `${school}-${grade}.csv`)

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const lines = csvContent.trim().split("\n")
    const headers = lines[0].split(",")

    // Find student data
    const studentLine = lines.slice(1).find((line) => {
      const data = line.split(",")
      return data[0] === studentId
    })

    if (!studentLine) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const studentData = studentLine.split(",")
    const studentName = studentData[1]
    const parentPassword = studentData[2]?.trim()

    // Check if parent password is required
    const requiresPassword = parentPassword && parentPassword !== "" && parentPassword !== "-"

    if (requiresPassword) {
      if (!providedPassword) {
        return NextResponse.json(
          {
            error: "Parent password required",
            requiresPassword: true,
          },
          { status: 401 },
        )
      }

      if (providedPassword !== parentPassword) {
        return NextResponse.json(
          {
            error: "Incorrect parent password",
            requiresPassword: true,
          },
          { status: 401 },
        )
      }
    }

    // Build subjects object from CSV
    const subjects: { [key: string]: { score: number | null; fullMark: number; isAbsent: boolean } } = {}

    for (let i = 3; i < headers.length; i++) {
      const subjectName = headers[i]
      const fullMark = 100
      const scoreValue = studentData[i]?.trim()

      const isAbsent = scoreValue === "-" || scoreValue === "" || scoreValue === undefined
      const score = isAbsent ? null : Number.parseFloat(scoreValue)

      subjects[subjectName] = {
        score,
        fullMark,
        isAbsent,
      }
    }

    return NextResponse.json({
      id: studentId,
      name: studentName,
      subjects,
      school,
      grade: gradeNum,
      requiresPassword: false,
    })
  } catch (error) {
    console.error("Error in results API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
