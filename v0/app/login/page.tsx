"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"
import { LogoLink } from "@/components/logo"
import { Waves } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to dashboard after successful login
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Invalid login credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-light to-white flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <LogoLink />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-navy">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Log in to your WaveRowers account</p>
          </div>

          <Card className="border-sand">
            <CardHeader>
              <CardTitle className="text-2xl text-navy">Log in</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-sand focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-sand focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-sand pt-4">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
              <Button variant="link" className="px-0 text-primary" asChild>
                <Link href="/forgot-password">Forgot your password?</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} WaveRowers. All rights reserved.</p>
      </div>

      {/* Decorative wave */}
      <div className="fixed bottom-0 left-0 w-full z-0 opacity-20 pointer-events-none">
        <Waves className="w-full h-24 text-primary" />
      </div>
    </div>
  )
}

