/**
 * Booking Repository
 *
 * Handles booking data access operations
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";
import { IBookingRepository } from "../interfaces/booking.repository.interface.js";
import { Booking, BookingStatus } from "../types/index.js";
import { PaymentStatus } from "../../payment/types/index.js";

export class BookingRepository implements IBookingRepository {
  /**
   * Create a new booking
   */
  async create(bookingData: {
    userId: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    totalPrice: number;
    notes?: string;
  }): Promise<Booking> {
    const traceId = `booking_create_${Date.now()}`;

    try {
      logger.info("📝 BookingRepository: Creating new booking", {
        traceId,
        userId: bookingData.userId,
        carId: bookingData.carId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
      });

      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          totalAmount: bookingData.totalPrice, // Map totalPrice to totalAmount for DB
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      logger.info("✅ BookingRepository: Booking created successfully", {
        traceId,
        bookingId: booking.id,
      });

      return booking as Booking;
    } catch (error) {
      logger.error("❌ BookingRepository: Error creating booking", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find booking by ID
   */
  async findById(id: string): Promise<Booking | null> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      return booking as Booking | null;
    } catch (error) {
      logger.error("❌ BookingRepository: Error finding booking by ID", {
        id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find bookings by user ID
   */
  async findByUserId(userId: string): Promise<Booking[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return bookings as Booking[];
    } catch (error) {
      logger.error("❌ BookingRepository: Error finding bookings by user ID", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking | null> {
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: { status },
      });

      return booking as Booking;
    } catch (error) {
      logger.error("❌ BookingRepository: Error updating booking status", {
        id,
        status,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find bookings with filters and pagination
   */
  async findWithFilters(filters: {
    userId?: string;
    carId?: string;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const traceId = `booking_find_filters_${Date.now()}`;

    try {
      logger.info("🔍 BookingRepository: Finding bookings with filters", {
        traceId,
        filters,
      });

      // Build where clause
      const whereClause: any = {};

      if (filters.userId) whereClause.userId = filters.userId;
      if (filters.carId) whereClause.carId = filters.carId;
      if (filters.status) whereClause.status = filters.status;

      // Date range filtering
      if (filters.startDate || filters.endDate) {
        whereClause.startDate = {};
        if (filters.startDate) whereClause.startDate.gte = filters.startDate;
        if (filters.endDate) whereClause.startDate.lte = filters.endDate;
      }

      // Calculate pagination
      const skip = (filters.page - 1) * filters.limit;

      // Build sort clause
      const orderBy: any = {};
      orderBy[filters.sortBy] = filters.sortOrder;

      // Execute queries with more detailed error handling
      try {
        const [bookings, total] = await Promise.all([
          prisma.booking.findMany({
            where: whereClause,
            skip,
            take: filters.limit,
            orderBy,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  type: true,
                  pricePerDay: true,
                },
              },
            },
          }),
          prisma.booking.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(total / filters.limit);

        logger.info("✅ BookingRepository: Bookings found with filters", {
          traceId,
          count: bookings.length,
          total,
          page: filters.page,
          totalPages,
        });

        return {
          bookings: bookings as Booking[],
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
        };
      } catch (includeError) {
        logger.error(
          "❌ BookingRepository: Error with includes, trying without",
          {
            traceId,
            includeError:
              includeError instanceof Error
                ? includeError.message
                : "Unknown include error",
          }
        );

        // Fallback: try without includes
        const [bookings, total] = await Promise.all([
          prisma.booking.findMany({
            where: whereClause,
            skip,
            take: filters.limit,
            orderBy,
          }),
          prisma.booking.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(total / filters.limit);

        logger.info("✅ BookingRepository: Bookings found without includes", {
          traceId,
          count: bookings.length,
          total,
          page: filters.page,
          totalPages,
        });

        return {
          bookings: bookings as Booking[],
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
        };
      }
    } catch (error) {
      logger.error(
        "❌ BookingRepository: Error finding bookings with filters",
        {
          traceId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      throw error;
    }
  }
}

// Export singleton instance
export const bookingRepository = new BookingRepository();
