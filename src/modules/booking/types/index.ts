/**
 * Booking Types
 *
 * Core type definitions for the booking module
 */

import { PaymentStatus } from "../../payment/types/index.js";

/**
 * Possible states of a booking
 */
export enum BookingStatus {
  PENDING = "PENDING", // Just created, awaiting confirmation/payment
  CONFIRMED = "CONFIRMED", // Confirmed and paid, ready for pickup
  ACTIVE = "ACTIVE", // Customer has picked up car, rental in progress
  COMPLETED = "COMPLETED", // Car returned, rental finished
  CANCELLED = "CANCELLED", // Cancelled by user or admin
}

/**
 * Basic booking structure
 * Matches Prisma schema
 */
export interface Booking {
  id: string;
  userId: string;
  carId: string;

  // Booking details
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number; // Database field
  totalPrice: number; // Application field (can be same as totalAmount)
  status: BookingStatus;

  // Payment info
  paymentId?: string;
  paymentStatus: PaymentStatus;

  // Additional
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Add more types as we need them
