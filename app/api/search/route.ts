import { type NextRequest, NextResponse } from "next/server"
import { semanticSearch } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const { query, language = "en" } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Perform semantic search
    const results = await semanticSearch(query, language)

    return NextResponse.json({
      results,
      total: results.length,
      query,
      language,
    })
  } catch (error) {
    console.error("Search API error:", error)
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
