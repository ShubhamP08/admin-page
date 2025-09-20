import { NextResponse } from "next/server"
import { uploadedDocuments } from "@/lib/data-store"

export async function GET() {
  try {
    // Return list of uploaded documents with metadata
    const documents = uploadedDocuments.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      chunks: doc.chunks.length,
      uploadedAt: doc.uploadedAt,
      contentLength: doc.content.length,
    }))

    return NextResponse.json({
      documents,
      total: documents.length,
    })
  } catch (error) {
    console.error("Documents API error:", error)
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
