/**
 * Booking Service
 *
 * Business logic for booking operations
 */

import { logger } from "../../../utils/logger/config.js";
import { IBookingRepository } from "../interfaces/booking.repository.interface.js";
import { Booking } from "../types/index.js";

export class BookingService {
  constructor(private bookingRepository: IBookingRepository) {}

  /**
   * Create a new booking
   */
  async createBooking(bookingData: {
    userId: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }): Promise<Booking> {
    const traceId = `booking_service_create_${Date.now()}`;

    try {
      logger.info("📝 BookingService: Creating booking", {
        traceId,
        userId: bookingData.userId,
        carId: bookingData.carId,
      });

      // TODO: Validate dates
      // TODO: Check car availability
      // TODO: Calculate pricing

      // For now, just calculate basic values
      const totalDays = this.calculateDays(
        bookingData.startDate,
        bookingData.endDate
      );
      const totalPrice = 50 * totalDays; // TODO: Get actual car price

      const booking = await this.bookingRepository.create({
        ...bookingData,
        totalDays,
        totalPrice,
      });

      logger.info("✅ BookingService: Booking created successfully", {
        traceId,
        bookingId: booking.id,
      });

      return booking;
    } catch (error) {
      logger.error("❌ BookingService: Error creating booking", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const traceId = `booking_service_get_${Date.now()}`;

    try {
      logger.info("🔍 BookingService: Getting booking by ID", {
        traceId,
        bookingId: id,
      });

      const booking = await this.bookingRepository.findById(id);

      if (booking) {
        logger.info("✅ BookingService: Booking found", {
          traceId,
          bookingId: booking.id,
        });
      } else {
        logger.warn("⚠️ BookingService: Booking not found", {
          traceId,
          bookingId: id,
        });
      }

      return booking;
    } catch (error) {
      logger.error("❌ BookingService: Error getting booking", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Calculate number of days between dates
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }
}

// Export service instance
import { bookingRepository } from "../repositories/booking.repository.js";
export const bookingService = new BookingService(bookingRepository);
