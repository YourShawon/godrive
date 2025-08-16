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
import { ICarRepository } from "../interfaces/car.repository.interface.js";
import {
  Car,
  CreateCarData,
  UpdateCarData,
  ListCarsFilters,
  PaginatedCarsResult,
} from "../types/index.js";

export class CarRepository implements ICarRepository {
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

  /**
   * Find all cars with filters and pagination
   */
  async findAll(filters: ListCarsFilters): Promise<PaginatedCarsResult> {
    try {
      logger.info("🔍 CarRepository: Finding cars with filters", { filters });

      // Build where clause
      const whereClause: any = {};

      if (filters.make)
        whereClause.make = { contains: filters.make, mode: "insensitive" };
      if (filters.model)
        whereClause.model = { contains: filters.model, mode: "insensitive" };
      if (filters.type) whereClause.type = filters.type;
      if (filters.transmission) whereClause.transmission = filters.transmission;
      if (filters.fuelType) whereClause.fuelType = filters.fuelType;
      if (filters.seats) whereClause.seats = filters.seats;
      if (filters.isAvailable !== undefined)
        whereClause.isAvailable = filters.isAvailable;
      if (filters.location)
        whereClause.location = {
          contains: filters.location,
          mode: "insensitive",
        };

      // Price range filtering
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        whereClause.pricePerDay = {};
        if (filters.minPrice !== undefined)
          whereClause.pricePerDay.gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
          whereClause.pricePerDay.lte = filters.maxPrice;
      }

      // Calculate pagination
      const skip = (filters.page - 1) * filters.limit;

      // Build sort clause
      const orderBy: any = {};
      orderBy[filters.sortBy] = filters.sortOrder;

      // Execute queries
      const [cars, total] = await Promise.all([
        prisma.car.findMany({
          where: whereClause,
          skip,
          take: filters.limit,
          orderBy,
        }),
        prisma.car.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / filters.limit);

      logger.info("✅ Cars found with filters", {
        count: cars.length,
        total,
        page: filters.page,
        totalPages,
      });

      return {
        cars: cars as Car[],
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
      };
    } catch (error) {
      logger.error("❌ Error finding cars with filters", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Delete a car by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.info("🗑️ CarRepository: Deleting car", { carId: id });

      await prisma.car.delete({
        where: { id },
      });

      logger.info("✅ Car deleted successfully", { carId: id });
      return true;
    } catch (error) {
      logger.error("❌ Error deleting car", {
        carId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Check if a car exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await prisma.car.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error("❌ Error checking car existence", {
        carId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Find cars by availability
   */
  async findByAvailability(isAvailable: boolean): Promise<Car[]> {
    try {
      const cars = await prisma.car.findMany({
        where: { isAvailable },
        orderBy: { createdAt: "desc" },
      });
      return cars as Car[];
    } catch (error) {
      logger.error("❌ Error finding cars by availability", {
        isAvailable,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find cars by location
   */
  async findByLocation(location: string): Promise<Car[]> {
    try {
      const cars = await prisma.car.findMany({
        where: {
          location: { contains: location, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
      });
      return cars as Car[];
    } catch (error) {
      logger.error("❌ Error finding cars by location", {
        location,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update car availability
   */
  async updateAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<Car | null> {
    try {
      logger.info("🔄 CarRepository: Updating car availability", {
        carId: id,
        isAvailable,
      });

      const car = await prisma.car.update({
        where: { id },
        data: { isAvailable },
      });

      logger.info("✅ Car availability updated", { carId: id, isAvailable });
      return car as Car;
    } catch (error) {
      logger.error("❌ Error updating car availability", {
        carId: id,
        isAvailable,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }
}

// Export singleton instance
export const carRepository = new CarRepository();
