import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // Create demo community
  const community = await prisma.community.create({
    data: {
      name: "Willow Creek Estates",
      slug: "willow-creek-estates",
      address: "123 Willow Creek Drive",
      city: "Austin",
      state: "TX",
      zip: "78701",
      subscriptionTier: "pro",
    },
  });
  console.log(`Created community: ${community.name}`);

  // Create test auth users for each role
  const roles = ["president", "treasurer", "secretary", "board_member", "homeowner"] as const;
  for (const role of roles) {
    const user = await prisma.user.create({
      data: {
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}`,
        email: `${role}@example.com`,
        password: await bcrypt.hash("password123", 12),
        emailVerified: new Date(),
      },
    });
    await prisma.appUser.create({
      data: {
        authUserId: user.id,
        communityId: community.id,
        role,
        isBoardMember: role !== "homeowner",
      },
    });
    console.log(`Created test user: ${user.email} (${role})`);
  }

  // Create homes
  const homes = await prisma.home.createMany({
    data: [
      { communityId: community.id, address: "123 Willow Creek Drive", unitNumber: "A", ownerName: "Jane Smith", ownerEmail: "jane@example.com", sqft: 2400 },
      { communityId: community.id, address: "125 Willow Creek Drive", unitNumber: "B", ownerName: "John Doe", ownerEmail: "john@example.com", sqft: 2200 },
      { communityId: community.id, address: "127 Willow Creek Drive", unitNumber: "C", ownerName: "Alice Johnson", ownerEmail: "alice@example.com", sqft: 2600 },
      { communityId: community.id, address: "129 Willow Creek Drive", unitNumber: "D", ownerName: "Bob Wilson", ownerEmail: "bob@example.com", sqft: 2100 },
    ],
  });
  console.log(`Created ${homes.count} homes`);

  // Create demo announcements
  await prisma.announcement.createMany({
    data: [
      { communityId: community.id, title: "Welcome to ProperHOA!", content: "We're excited to launch our new community management platform. Explore the features and let us know what you think!", priority: "high", isPinned: true, createdBy: "system" },
      { communityId: community.id, title: "Pool Maintenance", content: "The pool will be closed for maintenance this Saturday from 8 AM to 2 PM.", priority: "medium", createdBy: "system" },
    ],
  });

  // Create demo compliance items
  await prisma.complianceItem.createMany({
    data: [
      { communityId: community.id, type: "tax_filing", title: "Annual Tax Filing", dueDate: new Date("2026-04-15"), status: "upcoming" },
      { communityId: community.id, type: "insurance_renewal", title: "General Liability Insurance", dueDate: new Date("2026-06-01"), status: "upcoming" },
      { communityId: community.id, type: "annual_meeting", title: "Annual HOA Meeting", dueDate: new Date("2026-03-15"), status: "due_soon" },
    ],
  });

  // Create demo meeting
  await prisma.meeting.create({
    data: {
      communityId: community.id,
      title: "March Board Meeting",
      description: "Regular monthly board meeting to discuss community matters.",
      scheduledAt: new Date("2026-03-15T19:00:00Z"),
      location: "Community Center",
      type: "board",
      status: "scheduled",
      createdBy: "system",
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
