/**
 * Booking Repository
 *
 * Handles booking data access operations
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";
import { IBookingRepository } from "../interfaces/booking.repository.interface.js";
import { Booking, BookingStatus } from "../types/index.js";

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
          status: BookingStatus.PENDING,
          paymentStatus: "PENDING", // TODO: Use enum when available
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
}

// Export singleton instance
export const bookingRepository = new BookingRepository();
