import { type NextRequest, NextResponse } from "next/server"
import { uploadedDocuments, knowledgeBase, extractTextFromFile, chunkText } from "@/lib/data-store"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(file)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 })
    }

    // Create document record
    const documentId = `doc-${Date.now()}`
    const document = {
      id: documentId,
      filename: file.name,
      content: extractedText,
      chunks: [],
      uploadedAt: new Date().toISOString(),
    }

    // Chunk the text and add to knowledge base
    const chunks = chunkText(extractedText, file.name)
    document.chunks = chunks

    // Add chunks to global knowledge base
    knowledgeBase.push(...chunks)

    // Store document
    uploadedDocuments.push(document)

    console.log(`Uploaded document: ${file.name} (${chunks.length} chunks)`)

    return NextResponse.json({
      id: documentId,
      filename: file.name,
      size: file.size,
      type: file.type,
      chunks: chunks.length,
      message: "File uploaded and processed successfully",
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
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
