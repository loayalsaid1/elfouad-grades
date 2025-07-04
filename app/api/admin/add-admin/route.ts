import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, full_name, is_super_admin, school_ids } = await req.json()

  if (!email || !full_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Invite user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email)
    if (authError && !authError.message.includes("already registered")) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Get user id
    let userId = authUser?.user?.id
    if (!userId) {
      // Try to find in users table
      const { data: userRow } = await supabase.from("users").select("id").eq("email", email).single()
      userId = userRow?.id
    }
    if (!userId) return NextResponse.json({ error: "Could not determine user id for admin." }, { status: 400 })

    // Upsert user row
    await supabase.from("users").upsert({
      id: userId,
      full_name,
      is_super_admin,
    })

    // Remove all previous school access
    await supabase.from("user_school_access").delete().eq("user_id", userId)
    // Add new school access
    if (!is_super_admin && Array.isArray(school_ids) && school_ids.length > 0) {
      const accessRows = school_ids.map((school_id: number) => ({
        user_id: userId,
        school_id,
      }))
      await supabase.from("user_school_access").insert(accessRows)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add admin" }, { status: 500 })
  }
}
