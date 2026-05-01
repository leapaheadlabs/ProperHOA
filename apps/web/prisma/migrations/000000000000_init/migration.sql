CREATE EXTENSION IF NOT EXISTS vector;

-- NextAuth adapter tables (managed by Prisma, but included for completeness)
-- User, Account, Session, VerificationToken tables will be created by Prisma migrate

-- Application tables
CREATE TABLE IF NOT EXISTS "Community" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Community_slug_key" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "AppUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "authUserId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'homeowner',
    "homeId" TEXT,
    "phone" TEXT,
    "isBoardMember" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AppUser_authUserId_key" UNIQUE ("authUserId")
);

CREATE TABLE IF NOT EXISTS "Home" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "unitNumber" TEXT,
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "ownerPhone" TEXT,
    "sqft" INTEGER,
    "lotSize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Home_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "minioKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "contentText" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DocumentChunk" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Meeting" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT,
    "type" TEXT NOT NULL DEFAULT 'board',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "agenda" JSONB,
    "minutes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Violation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "photos" JSONB,
    "resolution" TEXT,
    "fineAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ArcRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dimensions" TEXT,
    "materials" TEXT,
    "plans" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "boardVote" JSONB,
    "decisionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ArcRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "invoiceId" TEXT,
    "communityId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "importBatchId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ImportBatch" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "format" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BankAccount" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "plaidAccountId" TEXT,
    "name" TEXT NOT NULL,
    "mask" TEXT,
    "type" TEXT NOT NULL,
    "balance" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ComplianceItem" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringInterval" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ComplianceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MaintenanceRequest" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "homeId" TEXT,
    "reportedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "photos" JSONB,
    "assignedTo" TEXT,
    "vendorName" TEXT,
    "vendorPhone" TEXT,
    "cost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");
CREATE INDEX IF NOT EXISTS "Document_communityId_idx" ON "Document"("communityId");
CREATE INDEX IF NOT EXISTS "Violation_communityId_idx" ON "Violation"("communityId");
CREATE INDEX IF NOT EXISTS "Meeting_communityId_idx" ON "Meeting"("communityId");
CREATE INDEX IF NOT EXISTS "Invoice_communityId_idx" ON "Invoice"("communityId");
CREATE INDEX IF NOT EXISTS "Transaction_communityId_idx" ON "Transaction"("communityId");
CREATE INDEX IF NOT EXISTS "ComplianceItem_communityId_idx" ON "ComplianceItem"("communityId");
CREATE INDEX IF NOT EXISTS "ActivityLog_communityId_createdAt_idx" ON "ActivityLog"("communityId", "createdAt" DESC);

-- HNSW index for vector search
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_idx" ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);

-- Row-Level Security policies
ALTER TABLE "Community" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Home" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meeting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Violation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArcRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImportBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MaintenanceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;

-- RLS policies (simplified - will be refined in Issue #15)
CREATE POLICY "Community_isolation" ON "Community" USING ("id" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "AppUser_isolation" ON "AppUser" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Home_isolation" ON "Home" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Document_isolation" ON "Document" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Meeting_isolation" ON "Meeting" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Violation_isolation" ON "Violation" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "ArcRequest_isolation" ON "ArcRequest" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Invoice_isolation" ON "Invoice" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Payment_isolation" ON "Payment" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Transaction_isolation" ON "Transaction" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "BankAccount_isolation" ON "BankAccount" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "Announcement_isolation" ON "Announcement" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "ComplianceItem_isolation" ON "ComplianceItem" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "MaintenanceRequest_isolation" ON "MaintenanceRequest" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "ChatSession_isolation" ON "ChatSession" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
CREATE POLICY "ActivityLog_isolation" ON "ActivityLog" USING ("communityId" = current_setting('app.current_community_id', true)::TEXT);
