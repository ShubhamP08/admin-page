"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Search, Upload, Clock } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import Link from "next/link"

interface DashboardStats {
  totalDocuments: number
  totalChats: number
  totalKnowledgeChunks: number
  recentActivity: Array<{
    id: string
    type: "upload" | "chat" | "search"
    description: string
    timestamp: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalChats: 0,
    totalKnowledgeChunks: 0,
    recentActivity: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch documents
        const docsResponse = await fetch("/api/documents")
        const docsData = await docsResponse.json()

        // Fetch chat history
        const historyResponse = await fetch("/api/history")
        const historyData = await historyResponse.json()

        // Calculate total chunks from documents
        const totalChunks = docsData.documents?.reduce((sum: number, doc: any) => sum + doc.chunks, 0) || 0

        // Create recent activity from chat history (last 5 items)
        const recentChats = (historyData.history || []).slice(0, 3).map((chat: any) => ({
          id: chat.id,
          type: "chat" as const,
          description: `Chat: "${chat.message.slice(0, 50)}${chat.message.length > 50 ? "..." : ""}"`,
          timestamp: chat.timestamp,
        }))

        // Add document uploads to recent activity
        const recentUploads = (docsData.documents || []).slice(0, 2).map((doc: any) => ({
          id: doc.id,
          type: "upload" as const,
          description: `Uploaded: ${doc.filename}`,
          timestamp: doc.uploadedAt,
        }))

        const allActivity = [...recentChats, ...recentUploads]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)

        setStats({
          totalDocuments: docsData.total || 0,
          totalChats: historyData.total || 0,
          totalKnowledgeChunks: totalChunks,
          recentActivity: allActivity,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4" />
      case "chat":
        return <MessageSquare className="h-4 w-4" />
      case "search":
        return <Search className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Uploaded to knowledge base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">Total conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Chunks</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKnowledgeChunks}</div>
              <p className="text-xs text-muted-foreground">Searchable text segments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-auto p-4 flex-col space-y-2">
                <Link href="/admin/upload">
                  <Upload className="h-6 w-6" />
                  <span>Upload Documents</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2 bg-transparent">
                <Link href="/admin/search">
                  <Search className="h-6 w-6" />
                  <span>Search Knowledge Base</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2 bg-transparent">
                <Link href="/api/history" target="_blank">
                  <MessageSquare className="h-6 w-6" />
                  <span>View Chat History</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activity and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity. Start by uploading documents or testing the chat API.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Available endpoints for external chatbot frontend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="font-mono">POST /api/chat</code>
                <Badge variant="secondary">Chat with bot</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="font-mono">GET /api/history</code>
                <Badge variant="secondary">Get chat history</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="font-mono">POST /api/search</code>
                <Badge variant="secondary">Search knowledge base</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <code className="font-mono">GET /api/documents</code>
                <Badge variant="secondary">List documents</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
