-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Note: HNSW indexes and vector columns will be created via Prisma migrations
-- This ensures the extension is available before migrations run
