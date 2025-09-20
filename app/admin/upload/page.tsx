"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, Upload, FileText, File } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

export default function AdminUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState("")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadError("")
    setUploadSuccess("")

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()

        // Add to local file list
        const newFile: UploadedFile = {
          id: result.id || Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }

        setFiles((prev) => [...prev, newFile])
      }

      setUploadSuccess(`Successfully uploaded ${acceptedFiles.length} file(s)`)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  })

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== fileId))
        setUploadSuccess("File deleted successfully")
      } else {
        setUploadError("Failed to delete file")
      }
    } catch (error) {
      setUploadError("Failed to delete file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <AdminLayout title="Document Upload">
      <div className="space-y-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Upload PDF, DOCX, or TXT files to build your knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOCX, and TXT files</p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Uploading files...</p>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSuccess && (
              <Alert className="mt-4">
                <AlertDescription>{uploadSuccess}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* File List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>{files.length} file(s) in knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No files uploaded yet. Upload some documents to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{file.type.split("/")[1]?.toUpperCase() || "FILE"}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
