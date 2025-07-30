/**
 * Seed script to add test user data
 * Run this once to add sample users to MongoDB
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log("🌱 Starting user seeding...");

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: "john.doe@example.com",
        password: "hashedpassword123", // In real app, this would be hashed
        name: "John Doe",
        role: "CUSTOMER",
        preferredCarTypes: ["SEDAN", "SUV"],
        language: "en",
        currency: "USD",
      },
    });

    console.log("✅ Test user created:", {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
    });

    // Create another test user
    const testUser2 = await prisma.user.create({
      data: {
        email: "jane.smith@example.com",
        password: "hashedpassword456",
        name: "Jane Smith",
        role: "CUSTOMER",
        preferredCarTypes: ["HATCHBACK"],
        language: "en",
        currency: "USD",
      },
    });

    console.log("✅ Test user 2 created:", {
      id: testUser2.id,
      email: testUser2.email,
      name: testUser2.name,
      role: testUser2.role,
    });

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`\n🧪 Test these endpoints:`);
    console.log(`GET /api/v1/users/${testUser.id}`);
    console.log(`GET /api/v1/users/${testUser2.id}`);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
