"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin login
    router.push("/admin/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-muted-foreground">Redirecting to admin login...</div>
    </div>
  )
}
