import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

// Rate limiting: check user's tier
async function checkRateLimit(communityId: string): Promise<boolean> {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { plan: true },
  });

  const limits: Record<string, number> = {
    free: 50,
    essential: 200,
    pro: 1000,
    enterprise: 5000,
  };

  const limit = limits[community?.plan || "free"];

  // Count today's requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.chatSession.count({
    where: {
      communityId,
      updatedAt: { gte: today },
    },
  });

  return count < limit;
}

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth.user.id;
  const communityId = req.auth.user.communityId;

  try {
    // Rate limit check
    const withinLimit = await checkRateLimit(communityId);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Daily AI request limit reached. Upgrade your plan for more." },
        { status: 429 }
      );
    }

    const { message, sessionId } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // 1. Generate embedding for user query
    const embedRes = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: message,
      }),
    });

    if (!embedRes.ok) {
      throw new Error(`Embedding failed: ${embedRes.status}`);
    }

    const embedData = await embedRes.json();
    const embedding = embedData.embedding;

    // 2. RAG: Find similar document chunks scoped to community
    const chunks = await prisma.$queryRaw`
      SELECT dc.id, dc.content, dc."chunkIndex", d.title as document, d.id as "documentId"
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      WHERE d."communityId" = ${communityId}
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${embedding}::vector
      LIMIT 5
    `;

    const relevantChunks = (chunks as any[]) || [];

    // 3. Build context from retrieved chunks
    const context = relevantChunks
      .map((c, i) => `[${i + 1}] From "${c.document}" (chunk ${c.chunkIndex}): ${c.content}`)
      .join("\n\n");

    const citations = relevantChunks.map((c, i) => ({
      number: i + 1,
      document: c.document,
      chunkIndex: c.chunkIndex,
      documentId: c.documentId,
    }));

    // 4. Build system prompt
    const systemPrompt = `You are the ProperHOA AI Board Assistant. You help homeowners and board members with questions about their community's rules, documents, and procedures.

Answer based ONLY on the following community documents. If the answer isn't in the documents, say so clearly and offer to escalate to the board.

Community Documents:
${context || "No documents available."}

Guidelines:
- Be concise and helpful
- Cite sources using [1], [2], etc.
- If unsure, say "I don't have enough information" and suggest escalating
- Never make up rules or policies`;

    // 5. Stream response from Ollama
    const encoder = new TextEncoder();
    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: systemPrompt,
        prompt: message,
        stream: true,
      }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      throw new Error("Ollama generation failed");
    }

    // 6. Store/update chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          communityId,
          userId,
          sessionType: "general",
          messages: [],
        },
      });
    }

    // Parse existing messages - Prisma Json field returns parsed value
    const messages = Array.isArray(chatSession.messages) ? (chatSession.messages as any[]) : [];
    messages.push({ role: "user", content: message, timestamp: new Date().toISOString() });

    // Stream response to client while collecting it
    let fullResponse = "";
    const readable = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value);
            const lines = text.split("\n").filter((l) => l.trim());
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  fullResponse += data.response;
                  controller.enqueue(encoder.encode(data.response));
                }
                if (data.done) {
                  // Save assistant response
                  messages.push({
                    role: "assistant",
                    content: fullResponse,
                    citations,
                    timestamp: new Date().toISOString(),
                  });
                  await prisma.chatSession.update({
                    where: { id: chatSession!.id },
                    data: {
                      messages: messages as any,
                      updatedAt: new Date(),
                    },
                  });
                  controller.close();
                  return;
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Session-Id": chatSession.id,
        "X-Citations": JSON.stringify(citations),
      },
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }
});
