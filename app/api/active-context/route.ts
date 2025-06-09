import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const school = searchParams.get("school")
  const grade = searchParams.get("grade")

  if (!school || !grade) {
    return NextResponse.json({ error: "School and grade parameters are required" }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // First, get the school_id
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("name", school)
      .single()

    if (schoolError || !schoolData) {
      console.error("Error fetching school:", schoolError)
      return NextResponse.json({ error: "School not found", details: schoolError }, { status: 404 })
    }

    // Then, get the active context for this school and grade
    const { data: contextData, error: contextError } = await supabase
      .from("academic_contexts")
      .select("*")
      .eq("school_id", schoolData.id)
      .eq("grade", Number.parseInt(grade))
      .eq("is_active", true)
      .single()

    if (contextError) {
      console.error("Error fetching active context:", contextError)

      // If no active context is found, fall back to the default from currentRound.ts
      const { CURRENT_ROUND } = await import("@/constants/currentRound")
      return NextResponse.json({
        year: CURRENT_ROUND.startYear,
        term: CURRENT_ROUND.term,
        fallback: true,
      })
    }

    return NextResponse.json({
      year: contextData.year,
      term: contextData.term,
      fallback: false,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Failed to fetch active context" }, { status: 500 })
  }
}
