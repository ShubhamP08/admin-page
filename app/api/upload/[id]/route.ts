import { type NextRequest, NextResponse } from "next/server"
import { uploadedDocuments, knowledgeBase } from "@/lib/data-store"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Find document
    const documentIndex = uploadedDocuments.findIndex((doc) => doc.id === id)

    if (documentIndex === -1) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const document = uploadedDocuments[documentIndex]

    // Remove chunks from knowledge base
    const chunkIds = document.chunks.map((chunk) => chunk.id)
    for (let i = knowledgeBase.length - 1; i >= 0; i--) {
      if (chunkIds.includes(knowledgeBase[i].id)) {
        knowledgeBase.splice(i, 1)
      }
    }

    // Remove document
    uploadedDocuments.splice(documentIndex, 1)

    console.log(`Deleted document: ${document.filename} (${document.chunks.length} chunks removed)`)

    return NextResponse.json({
      message: "Document deleted successfully",
      filename: document.filename,
      chunksRemoved: document.chunks.length,
    })
  } catch (error) {
    console.error("Delete API error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

// Enable CORS for external frontend access
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
