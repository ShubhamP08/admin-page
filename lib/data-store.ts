// In-memory data storage (to be replaced with database later)

export interface ChatInteraction {
  id: string
  message: string
  language: string
  reply: string
  timestamp: string
}

export interface KnowledgeChunk {
  id: string
  content: string
  source: string
  metadata: {
    filename: string
    page?: number
    section?: string
  }
}

export interface UploadedDocument {
  id: string
  filename: string
  content: string
  chunks: KnowledgeChunk[]
  uploadedAt: string
}

// In-memory storage
export const chatHistory: ChatInteraction[] = []
export const knowledgeBase: KnowledgeChunk[] = []
export const uploadedDocuments: UploadedDocument[] = []

// Placeholder functions for RAG functionality
export const getChatbotResponse = async (message: string, language: string): Promise<string> => {
  // Placeholder chatbot response logic
  const responses = {
    en: [
      "I understand your question about: " + message,
      "Based on the available information, I can help you with that.",
      "That's an interesting question. Let me provide some insights.",
      "I'm here to assist you with your inquiry about: " + message,
    ],
    es: [
      "Entiendo tu pregunta sobre: " + message,
      "Basado en la información disponible, puedo ayudarte con eso.",
      "Esa es una pregunta interesante. Permíteme darte algunas ideas.",
      "Estoy aquí para ayudarte con tu consulta sobre: " + message,
    ],
    fr: [
      "Je comprends votre question sur: " + message,
      "Basé sur les informations disponibles, je peux vous aider avec cela.",
      "C'est une question intéressante. Permettez-moi de vous donner quelques idées.",
      "Je suis là pour vous aider avec votre demande sur: " + message,
    ],
  }

  const langResponses = responses[language as keyof typeof responses] || responses.en
  const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)]

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return randomResponse
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  // Placeholder text extraction logic
  if (file.type === "text/plain") {
    return await file.text()
  } else if (file.type === "application/pdf") {
    // Placeholder for PDF extraction
    return `[Extracted text from PDF: ${file.name}]\n\nThis is placeholder text extracted from the PDF file. In a real implementation, this would use a PDF parsing library like pdf-parse or pdf2pic to extract the actual text content from the PDF file.`
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // Placeholder for DOCX extraction
    return `[Extracted text from DOCX: ${file.name}]\n\nThis is placeholder text extracted from the DOCX file. In a real implementation, this would use a library like mammoth.js to extract the actual text content from the Word document.`
  }

  return `[Unsupported file type: ${file.type}]`
}

export const semanticSearch = async (query: string, language: string): Promise<KnowledgeChunk[]> => {
  // Placeholder semantic search logic
  const searchTerms = query.toLowerCase().split(" ")

  const results = knowledgeBase.filter((chunk) => {
    const content = chunk.content.toLowerCase()
    return searchTerms.some((term) => content.includes(term))
  })

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Return top 5 results
  return results.slice(0, 5)
}

export const chunkText = (text: string, filename: string): KnowledgeChunk[] => {
  // Simple text chunking (split by paragraphs or every 500 characters)
  const chunks: KnowledgeChunk[] = []
  const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0)

  if (paragraphs.length > 1) {
    // Split by paragraphs
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length > 50) {
        // Only include substantial paragraphs
        chunks.push({
          id: `${filename}-chunk-${index}`,
          content: paragraph.trim(),
          source: filename,
          metadata: {
            filename,
            section: `paragraph-${index + 1}`,
          },
        })
      }
    })
  } else {
    // Split by character count if no clear paragraphs
    const chunkSize = 500
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize)
      chunks.push({
        id: `${filename}-chunk-${Math.floor(i / chunkSize)}`,
        content: chunk,
        source: filename,
        metadata: {
          filename,
          section: `chars-${i}-${i + chunkSize}`,
        },
      })
    }
  }

  return chunks
}
