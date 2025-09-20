"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FileText, Clock } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface SearchResult {
  id: string
  content: string
  source: string
  metadata: {
    filename: string
    page?: number
    section?: string
  }
}

export default function AdminSearch() {
  const [query, setQuery] = useState("")
  const [language, setLanguage] = useState("en")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searchStats, setSearchStats] = useState<{ total: number; query: string } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setSearchError("")
    setResults([])

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim(), language }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data.results || [])
      setSearchStats({ total: data.total || 0, query: data.query })
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  return (
    <AdminLayout title="Knowledge Base Search">
      <div className="space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Knowledge Base</CardTitle>
            <CardDescription>Search through uploaded documents to find relevant information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter your search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <Button type="submit" disabled={isSearching || !query.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>

            {searchError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Found {searchStats.total} result(s) for "{searchStats.query}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for your search query.</p>
                  <p className="text-sm mt-2">Try using different keywords or upload more documents.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={result.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Badge variant="secondary">{result.metadata.filename}</Badge>
                          {result.metadata.section && (
                            <Badge variant="outline" className="text-xs">
                              {result.metadata.section}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{result.source}</span>
                        </div>
                      </div>

                      <div className="text-sm leading-relaxed">
                        <p className="text-foreground">{truncateText(result.content)}</p>
                      </div>

                      {result.content.length > 200 && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          Show full content
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Use specific keywords</p>
                <p>More specific terms will yield better results than general queries.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Search className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Try different languages</p>
                <p>Select the appropriate language for better search accuracy.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Upload more documents</p>
                <p>The more documents you upload, the more comprehensive your search results will be.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
