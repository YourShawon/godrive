/**
 * Car Repository
 *
 * Responsibilities:
 * - Handle car data access operations
 * - Provide clean interface for car database operations
 * - Abstract database implementation details
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";

export class CarRepository {
  /**
   * Find a car by ID
   * @param id - Car ID to search for
   * @returns Car data or null if not found
   */
  async findById(id: string) {
    try {
      logger.info("🔍 CarRepository: Finding car by ID", { carId: id });

      const car = await prisma.car.findUnique({
        where: { id },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          type: true,
          color: true,
          transmission: true,
          fuelType: true,
          seats: true,
          doors: true,
          airConditioning: true,
          pricePerDay: true,
          isAvailable: true,
          location: true,
          images: true,
          description: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (car) {
        logger.info("✅ Car found successfully", { carId: id });
      } else {
        logger.warn("⚠️ Car not found", { carId: id });
      }

      return car;
    } catch (error) {
      logger.error("❌ Error finding car by ID", {
        carId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find multiple cars with filters, pagination, and sorting
   * @param options - Query options including filters, pagination, and sorting
   * @returns Paginated car results
   */
  async findMany(options: {
    filters?: any;
    pagination?: { page: number; limit: number };
    sort?: { field: string; order: "asc" | "desc" };
  }) {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
      sort = { field: "createdAt", order: "desc" as const },
    } = options;

    try {
      logger.info("🔍 CarRepository: Finding cars with filters", {
        filters,
        pagination,
        sort,
      });

      // Calculate skip for pagination
      const skip = (pagination.page - 1) * pagination.limit;

      // Build Prisma where clause
      const where: any = {};

      if (filters.make)
        where.make = { contains: filters.make, mode: "insensitive" };
      if (filters.type) where.type = filters.type;
      if (filters.transmission) where.transmission = filters.transmission;
      if (filters.fuelType) where.fuelType = filters.fuelType;
      if (filters.location)
        where.location = { contains: filters.location, mode: "insensitive" };
      if (filters.isAvailable !== undefined)
        where.isAvailable = filters.isAvailable;
      if (filters.pricePerDay) where.pricePerDay = filters.pricePerDay;

      // Year range filtering
      if (filters.minYear || filters.maxYear) {
        where.year = {};
        if (filters.minYear) where.year.gte = filters.minYear;
        if (filters.maxYear) where.year.lte = filters.maxYear;
      }

      // Search functionality (searches in make, model, description)
      if (filters.search) {
        where.OR = [
          { make: { contains: filters.search, mode: "insensitive" } },
          { model: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sort.field] = sort.order;

      // Execute queries in parallel
      const [cars, total] = await Promise.all([
        prisma.car.findMany({
          where,
          orderBy,
          skip,
          take: pagination.limit,
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            type: true,
            color: true,
            transmission: true,
            fuelType: true,
            seats: true,
            doors: true,
            airConditioning: true,
            pricePerDay: true,
            isAvailable: true,
            location: true,
            images: true,
            description: true,
            features: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.car.count({ where }),
      ]);

      logger.info("✅ Cars found successfully", {
        totalFound: total,
        returnedCount: cars.length,
        page: pagination.page,
        limit: pagination.limit,
      });

      return {
        cars,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      };
    } catch (error) {
      logger.error("❌ Error finding cars", {
        filters,
        pagination,
        sort,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create a new car
   * @param carData - Car data to create
   * @returns Created car data
   */
  async create(carData: any) {
    try {
      logger.info("🔍 CarRepository: Creating new car", {
        make: carData.make,
        model: carData.model,
        type: carData.type,
      });

      const car = await prisma.car.create({
        data: {
          make: carData.make,
          model: carData.model,
          year: carData.year,
          type: carData.type,
          color: carData.color,
          transmission: carData.transmission,
          fuelType: carData.fuelType,
          seats: carData.seats,
          doors: carData.doors,
          airConditioning: carData.airConditioning,
          pricePerDay: carData.pricePerDay,
          isAvailable: carData.isAvailable ?? true,
          location: carData.location,
          images: carData.images || [],
          description: carData.description,
          features: carData.features || [],
        },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          type: true,
          color: true,
          transmission: true,
          fuelType: true,
          seats: true,
          doors: true,
          airConditioning: true,
          pricePerDay: true,
          isAvailable: true,
          location: true,
          images: true,
          description: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info("✅ Car created successfully", {
        carId: car.id,
        make: car.make,
        model: car.model,
      });

      return car;
    } catch (error) {
      logger.error("❌ Error creating car", {
        carData: {
          make: carData.make,
          model: carData.model,
          type: carData.type,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update an existing car
   * @param id - Car ID to update
   * @param updateData - Partial car data to update
   * @returns Updated car data
   */
  async update(id: string, updateData: any) {
    try {
      logger.info("🔍 CarRepository: Updating car", {
        carId: id,
        updateFields: Object.keys(updateData),
      });

      // Build update object with only provided fields
      const data: any = {};

      if (updateData.make !== undefined) data.make = updateData.make;
      if (updateData.model !== undefined) data.model = updateData.model;
      if (updateData.year !== undefined) data.year = updateData.year;
      if (updateData.type !== undefined) data.type = updateData.type;
      if (updateData.color !== undefined) data.color = updateData.color;
      if (updateData.transmission !== undefined)
        data.transmission = updateData.transmission;
      if (updateData.fuelType !== undefined)
        data.fuelType = updateData.fuelType;
      if (updateData.seats !== undefined) data.seats = updateData.seats;
      if (updateData.doors !== undefined) data.doors = updateData.doors;
      if (updateData.airConditioning !== undefined)
        data.airConditioning = updateData.airConditioning;
      if (updateData.pricePerDay !== undefined)
        data.pricePerDay = updateData.pricePerDay;
      if (updateData.isAvailable !== undefined)
        data.isAvailable = updateData.isAvailable;
      if (updateData.location !== undefined)
        data.location = updateData.location;
      if (updateData.images !== undefined) data.images = updateData.images;
      if (updateData.description !== undefined)
        data.description = updateData.description;
      if (updateData.features !== undefined)
        data.features = updateData.features;

      const car = await prisma.car.update({
        where: { id },
        data,
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          type: true,
          color: true,
          transmission: true,
          fuelType: true,
          seats: true,
          doors: true,
          airConditioning: true,
          pricePerDay: true,
          isAvailable: true,
          location: true,
          images: true,
          description: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info("✅ Car updated successfully", {
        carId: id,
        make: car.make,
        model: car.model,
        updatedFields: Object.keys(data),
      });

      return car;
    } catch (error) {
      logger.error("❌ Error updating car", {
        carId: id,
        updateData: Object.keys(updateData),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export a singleton instance
export const carRepository = new CarRepository();
