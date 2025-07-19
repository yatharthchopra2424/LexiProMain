"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Mic, Volume2, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { generateAnswer } from "./actions"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ClientAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await generateAnswer(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting answer:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleVoiceInput = () => {
    // Placeholder for voice-to-text functionality (e.g., "Case to Voice")
    // In a real application, you would integrate a Web Speech API or a third-party service.
    setIsListening(!isListening)
    if (!isListening) {
      console.log("Starting voice input...")
      // Simulate voice input
      setTimeout(() => {
        const voiceText = "What are my rights as a tenant in India?"
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: voiceText,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setIsListening(false)
        console.log("Voice input received:", voiceText)
        generateAnswer(voiceText).then((result) => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: result,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        })
      }, 2000)
    } else {
      console.log("Stopping voice input.")
    }
  }

  const handleTextToSpeech = (text: string) => {
    // Placeholder for text-to-speech functionality (e.g., "Voice to Case" output)
    // In a real application, you would integrate a Web Speech API or a third-party service.
    setIsSpeaking(true)
    console.log("Speaking:", text)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <Card className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Lexi AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    <p>Start a conversation with Lexi, your AI legal assistant.</p>
                    <p>Ask me anything about legal topics, document drafting, or case research.</p>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-logo.png" alt="Lexi AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-800 text-gray-50 rounded-bl-none"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-strong:text-white prose-a:text-white prose-headings:text-white prose-li:text-white">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                      {m.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-2 h-6 w-6 text-gray-400 hover:text-white"
                          onClick={() => handleTextToSpeech(m.content)}
                          disabled={isSpeaking}
                        >
                          {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                          <span className="sr-only">Read aloud</span>
                        </Button>
                      )}
                    </div>
                    {m.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>YOU</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && messages.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg bg-gray-800 text-gray-50 rounded-bl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className={`text-gray-400 hover:text-white ${isListening ? "text-red-500 animate-pulse" : ""}`}
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-yellow-400"
                placeholder="Type your legal question here..."
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
