"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginNavBar() {
  const router = useRouter()
  const pathname = usePathname()

  const isStudent = pathname.includes("student-login")

  return (
    <div className="flex justify-center p-4">
      <div className="flex space-x-2 rounded-full border border-gray-300 p-1">
        <Button
          onClick={() => router.push("/admin")}
          variant={isStudent ? "ghost" : "default"}
          className="rounded-full px-6"
        >
          Admin Login
        </Button>
        <Button
          onClick={() => router.push("/student-login")}
          variant={isStudent ? "default" : "ghost"}
          className="rounded-full px-6"
        >
          Student Login
        </Button>
      </div>
    </div>
  )
}