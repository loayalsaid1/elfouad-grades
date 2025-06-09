import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const school = searchParams.get("school")
    const grade = searchParams.get("grade")

    if (!school || !grade) {
      return NextResponse.json({ error: "School and grade are required" }, { status: 400 })
    }

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
      .select("year, term")
      .eq("school_id", schoolData.id)
      .eq("grade", gradeNum)
      .eq("is_active", true)
      .single()

    if (contextError || !contextData) {
      return NextResponse.json({ error: "No active academic context found for this school and grade" }, { status: 404 })
    }

    return NextResponse.json({
      year: contextData.year,
      term: contextData.term,
      fallback: false,
    })
  } catch (error) {
    console.error("Error fetching active context:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
