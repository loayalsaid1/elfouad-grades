import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const school = searchParams.get("school")
    const grade = searchParams.get("grade")

    // Always fall back to currentRound if no params or database issues
    const { CURRENT_ROUND } = await import("@/constants/currentRound")
    const fallbackResponse = {
      year: CURRENT_ROUND.startYear,
      term: CURRENT_ROUND.term,
      fallback: true,
    }

    if (!school || !grade) {
      return NextResponse.json(fallbackResponse)
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get school by slug
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", school)
      .maybeSingle()

    if (schoolError || !schoolData) {
      console.log("School not found in database, using fallback")
      return NextResponse.json(fallbackResponse)
    }

    // Get active context
    const { data: contextData, error: contextError } = await supabase
      .from("academic_contexts")
      .select("year, term")
      .eq("school_id", schoolData.id)
      .eq("grade", Number.parseInt(grade))
      .eq("is_active", true)
      .maybeSingle()

    if (contextError || !contextData) {
      console.log("No active context found, using fallback")
      return NextResponse.json(fallbackResponse)
    }

    return NextResponse.json({
      year: contextData.year,
      term: contextData.term,
      fallback: false,
    })
  } catch (error) {
    console.error("Error in active-context API:", error)
    // Always return fallback on any error
    const { CURRENT_ROUND } = await import("@/constants/currentRound")
    return NextResponse.json({
      year: CURRENT_ROUND.startYear,
      term: CURRENT_ROUND.term,
      fallback: true,
    })
  }
}
