import { NextResponse } from "next/server"
import { chatHistory } from "@/lib/data-store"

export async function GET() {
  try {
    // Return chat history sorted by most recent first
    const sortedHistory = [...chatHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    return NextResponse.json({
      history: sortedHistory,
      total: sortedHistory.length,
    })
  } catch (error) {
    console.error("History API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Enable CORS for external frontend access
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
