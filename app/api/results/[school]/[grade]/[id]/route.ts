import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getStudentById } from "@/services/studentService"
import { CURRENT_ROUND } from "@/constants/currentRound"

export async function GET(request: NextRequest, { params }: { params: { school: string; grade: string; id: string } }) {
  const { school, grade, id } = params

  // Get year and term from query params or fall back to currentRound
  const searchParams = request.nextUrl.searchParams
  const year = Number.parseInt(searchParams.get("year") || String(CURRENT_ROUND.startYear))
  const term = Number.parseInt(searchParams.get("term") || String(CURRENT_ROUND.term))

  try {
    // First try to get from Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Get school_id
    const { data: schoolData } = await supabase.from("schools").select("id").eq("name", school).single()

    if (schoolData) {
      // Get academic context
      const { data: contextData } = await supabase
        .from("academic_contexts")
        .select("id")
        .eq("school_id", schoolData.id)
        .eq("year", year)
        .eq("term", term)
        .eq("grade", Number.parseInt(grade))
        .single()

      if (contextData) {
        // Get student results
        const { data: studentData, error } = await supabase
          .from("student_results")
          .select("*")
          .eq("context_id", contextData.id)
          .eq("student_id", id)
          .single()

        if (studentData && !error) {
          // Format the data to match the expected structure
          return NextResponse.json({
            id: studentData.student_id,
            name: studentData.student_name,
            parent_password: studentData.parent_password || null,
            scores: studentData.scores,
          })
        }
      }
    }

    // // Fall back to file-based system if no data in Supabase
    // const student = await getStudentById(id, school, grade)
// 
    // if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    // }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Failed to fetch student data" }, { status: 500 })
  }
}
