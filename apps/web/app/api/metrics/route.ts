import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple Prometheus-style metrics endpoint
export const GET = async () => {
  const timestamp = Date.now();

  const totalUsers = await prisma.appUser.count();
  const totalCommunities = await prisma.community.count();
  const totalTransactions = await prisma.transaction.count();
  const totalViolations = await prisma.violation.count();
  const totalMeetings = await prisma.meeting.count();
  const totalDocuments = await prisma.document.count();

  const metrics = [
    `# HELP properhoa_users_total Total number of users`,
    `# TYPE properhoa_users_total gauge`,
    `properhoa_users_total ${totalUsers}`,
    ``,
    `# HELP properhoa_communities_total Total number of communities`,
    `# TYPE properhoa_communities_total gauge`,
    `properhoa_communities_total ${totalCommunities}`,
    ``,
    `# HELP properhoa_transactions_total Total number of transactions`,
    `# TYPE properhoa_transactions_total gauge`,
    `properhoa_transactions_total ${totalTransactions}`,
    ``,
    `# HELP properhoa_violations_total Total number of violations`,
    `# TYPE properhoa_violations_total gauge`,
    `properhoa_violations_total ${totalViolations}`,
    ``,
    `# HELP properhoa_meetings_total Total number of meetings`,
    `# TYPE properhoa_meetings_total gauge`,
    `properhoa_meetings_total ${totalMeetings}`,
    ``,
    `# HELP properhoa_documents_total Total number of documents`,
    `# TYPE properhoa_documents_total gauge`,
    `properhoa_documents_total ${totalDocuments}`,
  ].join("\n");

  return new NextResponse(metrics, {
    headers: { "Content-Type": "text/plain" },
  });
};
