import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { email, full_name, is_super_admin, school_ids } = req.body

  if (!email || !full_name) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    // Invite user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email)
    if (authError && !authError.message.includes("already registered")) {
      return res.status(400).json({ error: authError.message })
    }

    // Get user id
    let userId = authUser?.user?.id
    if (!userId) {
      // Try to find in users table
      const { data: userRow } = await supabase.from("users").select("id").eq("email", email).single()
      userId = userRow?.id
    }
    if (!userId) return res.status(400).json({ error: "Could not determine user id for admin." })

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

    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to add admin" })
  }
}
