import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { school: string; grade: string; id: string } }) {
  try {
    const { school, grade, id: studentId } = params
    const { searchParams } = new URL(request.url)
    const providedPassword = searchParams.get("password")

    // Validate parameters
    const gradeNum = Number.parseInt(grade)
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return NextResponse.json({ error: "Invalid grade" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get school by slug
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", school)
      .single()

    if (schoolError || !schoolData) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    // Get active context for this school and grade
    const { data: contextData, error: contextError } = await supabase
      .from("academic_contexts")
      .select("id")
      .eq("school_id", schoolData.id)
      .eq("grade", gradeNum)
      .eq("is_active", true)
      .single()

    if (contextError || !contextData) {
      return NextResponse.json({ error: "No active academic context found for this school and grade" }, { status: 404 })
    }

    // Get student results
    const { data: studentData, error: studentError } = await supabase
      .from("student_results")
      .select("*")
      .eq("context_id", contextData.id)
      .eq("student_id", studentId)
      .single()

    if (studentError || !studentData) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

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
  } catch (error) {
    console.error("Error in results API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
