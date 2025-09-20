"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (activeTab === "admin") {
      // Hardcoded admin credentials
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("adminAuth", "true")
        router.push("/admin/upload")
      } else {
        setError("Invalid admin credentials")
      }
    } else {
      // Student login (for now just demo check)
      if (username === "student" && password === "student123") {
        localStorage.setItem("studentAuth", "true")
        router.push("/student/dashboard")
      } else {
        setError("Invalid student credentials")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Navbar Tabs
      <div className="flex space-x-6 mb-6 border-b border-muted-foreground">
        <button
          onClick={() => setActiveTab("admin")}
          className={`pb-2 text-lg font-semibold ${
            activeTab === "admin" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          Admin Login
        </button>
      </div> */}

      {/* Login Form */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {activeTab === "student" ? "Student Login" : "Admin Login"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
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
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {activeTab === "student"
              ? "Demo credentials: student / student123"
              : "Demo credentials: admin / admin123"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
