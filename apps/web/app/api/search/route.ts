import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MeiliSearch } from "meilisearch";

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const INDEX_NAME = "documents";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    // Ensure index exists
    try {
      await meili.getIndex(INDEX_NAME);
    } catch {
      await meili.createIndex(INDEX_NAME, { primaryKey: "id" });
    }

    const results = await meili.index(INDEX_NAME).search(q, {
      filter: [`communityId = ${communityId}`],
      limit: 20,
    });

    return NextResponse.json({
      hits: results.hits,
      total: results.estimatedTotalHits,
    });
  } catch (error: any) {
    // Fallback to DB search if Meilisearch fails
    const fallback = await prisma.document.findMany({
      where: {
        communityId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { contentText: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    });

    return NextResponse.json({ hits: fallback, total: fallback.length, fallback: true });
  }
});
