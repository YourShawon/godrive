/**
 * Booking Repository Interface
 *
 * Defines the contract for booking data access operations
 */

import { Booking, BookingStatus } from "../types/index.js";

export interface IBookingRepository {
  /**
   * Create a new booking
   */
  create(bookingData: {
    userId: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    totalPrice: number;
    notes?: string;
  }): Promise<Booking>;

  /**
   * Find booking by ID
   */
  findById(id: string): Promise<Booking | null>;

  /**
   * Find bookings by user ID
   */
  findByUserId(userId: string): Promise<Booking[]>;

  /**
   * Update booking status
   */
  updateStatus(id: string, status: BookingStatus): Promise<Booking | null>;

  // TODO: Add more methods as we need them
  // - findByCarId
  // - checkAvailability
  // - cancel booking
}
