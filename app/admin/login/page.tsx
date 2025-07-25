"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Log admin login event
        try {
          const user = (await supabase.auth.getUser()).data.user
          let ip_address = null
          let latitude = null
          let longitude = null
          // Fetch public IP
          try {
            const ipRes = await fetch('https://api.ipify.org?format=json')
            const ipData = await ipRes.json()
            ip_address = ipData.ip
          } catch {}
          // Fetch geolocation
          if (typeof window !== 'undefined' && navigator.geolocation) {
            try {
              await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    latitude = pos.coords.latitude
                    longitude = pos.coords.longitude
                    resolve()
                  },
                  () => resolve(),
                  { timeout: 3000 }
                )
              })
            } catch {}
          }
          if (user) {
            await supabase.from("admin_logins").insert({
              user_id: user.id,
              email: user.email,
              ip_address,
              user_agent: (typeof window !== 'undefined' && window.navigator.userAgent) ? window.navigator.userAgent : null,
              latitude,
              longitude,
            })
          }
        } catch (logErr) {
          // Ignore logging errors
        }
        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset password")
      return
    }
    setResetLoading(true)
    setError(null)
    setResetSent(false)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full px-2 py-14 bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="w-full max-w-md shadow-2xl border-2 hover:border-[#223152] transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#223152]">Admin Login</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access the El Fouad Schools admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {resetSent && (
              <Alert className="mb-4 bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300">
                <AlertDescription className="text-green-800">
                  Password reset email sent. Please check your inbox.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="transition-all duration-300 focus:border-[#223152] focus:ring-[#223152]"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-300 focus:border-[#223152] focus:ring-[#223152]"
                required
              />
            </div>
            <div>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="px-0 font-normal text-[#223152] hover:text-[#1a2642]"
                onClick={handleResetPassword}
                disabled={resetLoading}
              >
                Forgot password?
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#223152] hover:bg-[#1a2642] text-white transition-all duration-300 hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">El Fouad Schools Group Admin Portal</p>
        </CardFooter>
      </Card>
    </div>
  )
}
