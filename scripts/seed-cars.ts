/**
 * Seed Car Data
 *
 * Simple script to add test car data to the database
 * Run with: tsx scripts/seed-cars.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCars() {
  console.log("🌱 Starting car data seeding...");

  try {
    // Create a sample car
    const car1 = await prisma.car.create({
      data: {
        make: "Toyota",
        model: "Camry",
        year: 2023,
        type: "SEDAN",
        color: "Silver",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        seats: 5,
        doors: 4,
        airConditioning: true,
        pricePerDay: 45.99,
        isAvailable: true,
        location: "Downtown Office",
        images: [
          "https://example.com/car1-front.jpg",
          "https://example.com/car1-side.jpg",
        ],
        description:
          "Comfortable and reliable sedan perfect for city driving and business trips.",
        features: [
          "Bluetooth connectivity",
          "Backup camera",
          "Cruise control",
          "GPS navigation",
        ],
      },
    });

    console.log("✅ Created car:", {
      id: car1.id,
      make: car1.make,
      model: car1.model,
      year: car1.year,
    });

    // Create another sample car
    const car2 = await prisma.car.create({
      data: {
        make: "Honda",
        model: "CR-V",
        year: 2024,
        type: "SUV",
        color: "Blue",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        seats: 5,
        doors: 4,
        airConditioning: true,
        pricePerDay: 65.99,
        isAvailable: true,
        location: "Airport Branch",
        images: [
          "https://example.com/car2-front.jpg",
          "https://example.com/car2-interior.jpg",
        ],
        description:
          "Spacious SUV ideal for family trips and outdoor adventures.",
        features: [
          "All-wheel drive",
          "Sunroof",
          "Premium sound system",
          "Lane departure warning",
        ],
      },
    });

    console.log("✅ Created car:", {
      id: car2.id,
      make: car2.make,
      model: car2.model,
      year: car2.year,
    });

    console.log("\n🎉 Car seeding completed successfully!");
    console.log("\nTest your endpoints:");
    console.log(`- GET /api/v1/cars/${car1.id}`);
    console.log(`- GET /api/v1/cars/${car2.id}`);
  } catch (error) {
    console.error("❌ Error seeding cars:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedCars();
