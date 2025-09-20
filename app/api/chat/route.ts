import { type NextRequest, NextResponse } from "next/server"
import { chatHistory, getChatbotResponse } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const { message, language = "en" } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get chatbot response
    const reply = await getChatbotResponse(message, language)

    // Log interaction in memory
    const interaction = {
      id: Date.now().toString(),
      message,
      language,
      reply,
      timestamp: new Date().toISOString(),
    }

    chatHistory.push(interaction)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Enable CORS for external frontend access
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
