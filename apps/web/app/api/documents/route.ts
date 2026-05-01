import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET || "properhoa";

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id || !req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const isPublic = formData.get("isPublic") === "true";

    if (!file || !title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `documents/${communityId}/${Date.now()}-${file.name}`;

    // Upload to MinIO
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Extract text for search (simplified — in production use pdf-parse)
    let contentText = "";
    if (file.type === "text/plain") {
      contentText = new TextDecoder().decode(bytes);
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        communityId,
        title,
        type,
        minioKey: key,
        fileSize: buffer.length,
        mimeType: file.type,
        contentText: contentText || null,
        isPublic,
        createdBy: req.auth.user.id,
      },
    });

    // TODO: Index in Meilisearch
    // TODO: Chunk and generate embeddings for AI RAG

    // Log activity
    await prisma.activityLog.create({
      data: {
        communityId,
        userId: req.auth.user.id,
        action: "Document uploaded",
        entityType: "document",
        entityId: document.id,
        details: { title, type, size: buffer.length },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
});

export const GET = auth(async (req) => {
  if (!req.auth?.user?.communityId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communityId = req.auth.user.communityId;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const isPublic = searchParams.get("isPublic");

  try {
    const where: any = { communityId };
    if (type) where.type = type;
    if (isPublic !== null) where.isPublic = isPublic === "true";

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Generate signed URLs for download
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc: any) => {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET, Key: doc.minioKey }),
          { expiresIn: 3600 }
        );
        return { ...doc, downloadUrl: url };
      })
    );

    return NextResponse.json({ documents: documentsWithUrls });
  } catch (error: any) {
    console.error("Document list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
