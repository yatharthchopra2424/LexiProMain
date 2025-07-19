"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, BookOpen, Sparkles, Lightbulb, MessageSquare } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
interface StorySegment {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

export default function StoryModePage() {
  const [storySegments, setStorySegments] = useState<StorySegment[]>([
    {
      id: "intro",
      role: "ai",
      content:
        "Welcome, counselor. I am Judge Cy, your guide in this legal narrative. Present the case details, and I shall weave the story of justice.",
      timestamp: new Date(),
    },
  ])
  const [inputPrompt, setInputPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const storyEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [storySegments])

  const handleGenerateStory = async () => {
    if (inputPrompt.trim() === "") return

    const newUserSegment: StorySegment = {
      id: Date.now().toString(),
      role: "user",
      content: inputPrompt,
      timestamp: new Date(),
    }
    setStorySegments((prevSegments) => [...prevSegments, newUserSegment])
    setInputPrompt("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputPrompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch story segment")
      }

      const aiResponse = await response.json()

      const newAiSegment: StorySegment = {
        id: Date.now().toString() + "-ai",
        role: "ai",
        content: aiResponse.text || "I'm sorry, I couldn't generate a story segment at this time. Please try again.",
        timestamp: new Date(),
      }
      setStorySegments((prevSegments) => [...prevSegments, newAiSegment])
    } catch (error) {
      console.error("Error generating story:", error)
      const errorMessage: StorySegment = {
        id: Date.now().toString() + "-error",
        role: "ai",
        content: "An error occurred while generating the story. Please try again later.",
        timestamp: new Date(),
      }
      setStorySegments((prevSegments) => [...prevSegments, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Story Mode</h1>
            <p className="text-gray-400">Craft a legal drama with an AI-powered judge</p>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 flex flex-col h-[70vh]">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Your Story
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 prose prose-invert max-w-none">
                  {storySegments.map((segment) => (
                    <div
                      key={segment.id}
                      className={`flex items-start gap-3 ${segment.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {segment.role === "ai" && (
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] p-4 rounded-lg ${
                          segment.role === "user"
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-gray-800 text-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{segment.content}</p>
                        <span className="block text-xs text-gray-400 mt-1">
                          {segment.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {segment.role === "user" && (
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                          You
                        </div>
                      )}
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex items-start gap-3 justify-start">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        AI
                      </div>
                      <div className="max-w-[70%] p-4 rounded-lg bg-gray-800 text-gray-200 rounded-bl-none">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">Generating story...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={storyEndRef} />
                </div>
              </ScrollArea>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
                <Textarea
                  placeholder="Continue the story or give me a new prompt..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleGenerateStory()
                    }
                  }}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[50px] max-h-[150px] resize-y"
                  rows={1}
                />
                <Button
                  onClick={handleGenerateStory}
                  disabled={inputPrompt.trim() === "" || isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  <Send className="w-5 h-5" />
                  <span className="sr-only">Generate</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
