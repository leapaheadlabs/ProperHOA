"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIChatBubble } from "@/components/custom/ai-chat-bubble";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Loader2, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ number: number; document: string; chunkIndex: number }>;
  isLoading?: boolean;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get response");
      }

      // Get session ID and citations from headers
      const newSessionId = res.headers.get("X-Session-Id");
      const citationsHeader = res.headers.get("X-Citations");
      const citations = citationsHeader ? JSON.parse(citationsHeader) : [];
      if (newSessionId) setSessionId(newSessionId);

      // Read streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "", citations, isLoading: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        assistantContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = assistantContent;
          }
          return newMessages;
        });
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === "assistant") {
          lastMsg.isLoading = false;
        }
        return newMessages;
      });
    } catch (err: any) {
      setError(err.message);
      setMessages((prev) => prev.slice(0, -1)); // Remove loading message
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageIndex: number, type: "up" | "down") => {
    const message = messages[messageIndex];
    if (!message || message.role !== "assistant") return;

    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messageIndex,
          type,
        }),
      });
    } catch {
      // Silently fail
    }
  };

  const handleEscalate = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/ai/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I've notified the board about your question. They'll get back to you soon!",
        },
      ]);
    } catch {
      setError("Failed to escalate. Please contact the board directly.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h1 className="font-semibold">AI Board Assistant</h1>
          <p className="text-xs text-muted-foreground">Ask about rules, procedures, community documents</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">How can I help?</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me about your community's CC&Rs, bylaws, rules, meeting procedures, or any HOA-related questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["What are the pet rules?", "When is the next meeting?", "How do I pay dues?", "Can I paint my fence?"].map((q) => (
                <Button key={q} variant="outline" size="sm" onClick={() => { setInput(q); }}>
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <AIChatBubble
            key={i}
            message={msg.content}
            isUser={msg.role === "user"}
            citations={msg.citations?.map((c) => ({ document: c.document, page: c.chunkIndex }))}
            onFeedback={msg.role === "assistant" && !msg.isLoading ? (type) => handleFeedback(i, type) : undefined}
            onEscalate={msg.role === "assistant" && !msg.isLoading ? handleEscalate : undefined}
            isLoading={msg.isLoading}
          />
        ))}

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Ask about community rules, dues, meetings..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI responses are based on community documents. Always verify critical decisions with the board.
        </p>
      </div>
    </div>
  );
}
