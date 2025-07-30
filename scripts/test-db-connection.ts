/**
 * Database Connection Test
 * Tests MongoDB Atlas connection with detailed diagnostics
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testConnection() {
  console.log("🔍 Testing MongoDB Atlas connection...");
  console.log(
    "📊 Connection string (masked):",
    process.env.DATABASE_URL?.replace(/:[^:]*@/, ":****@")
  );

  try {
    console.log("\n1️⃣ Testing Prisma connection...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");

    console.log("\n2️⃣ Testing database ping...");
    await prisma.$runCommandRaw({ ping: 1 });
    console.log("✅ Database ping successful");

    console.log("\n3️⃣ Testing simple query...");
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful - Found ${userCount} users`);

    console.log("\n4️⃣ Testing user table structure...");
    const sampleUsers = await prisma.user.findMany({
      take: 1,
      select: { id: true, email: true, name: true },
    });
    console.log("✅ Table structure verified");

    if (sampleUsers.length > 0) {
      console.log("📋 Sample user:", sampleUsers[0]);
    } else {
      console.log("📋 No users found in database");
    }

    console.log("\n🎉 All connection tests passed!");
  } catch (error) {
    console.error("\n❌ Connection test failed:");

    if (error instanceof Error) {
      console.error("Error message:", error.message);

      // Check for specific MongoDB Atlas issues
      if (error.message.includes("Server selection timeout")) {
        console.error("\n🔧 Possible fixes:");
        console.error("1. Check MongoDB Atlas cluster is running");
        console.error("2. Verify IP whitelist (add 0.0.0.0/0 for testing)");
        console.error("3. Check username/password in connection string");
        console.error("4. Verify network connectivity");
      }

      if (error.message.includes("Authentication failed")) {
        console.error("\n🔧 Authentication issue:");
        console.error("1. Check username and password");
        console.error("2. Verify database user permissions");
      }
    }

    console.error("\nFull error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from database");
  }
}

testConnection();
