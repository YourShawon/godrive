/**
 * Payment Repository Interface
 *
 * Defines the contract for payment data access operations
 */

import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentStatus,
} from "../types/index.js";

export interface IPaymentRepository {
  /**
   * Create a new payment record
   */
  create(paymentData: CreatePaymentData): Promise<Payment>;

  /**
   * Find a payment by ID
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Find a payment by provider payment ID (e.g., Stripe Payment Intent ID)
   */
  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;

  /**
   * Find payments by booking ID
   */
  findByBookingId(bookingId: string): Promise<Payment[]>;

  /**
   * Find payments by status
   */
  findByStatus(status: PaymentStatus): Promise<Payment[]>;

  /**
   * Update a payment by ID
   */
  update(id: string, paymentData: UpdatePaymentData): Promise<Payment | null>;

  /**
   * Update payment by provider payment ID
   */
  updateByProviderPaymentId(
    providerPaymentId: string,
    paymentData: UpdatePaymentData
  ): Promise<Payment | null>;

  /**
   * Delete a payment by ID (soft delete recommended)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a payment exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get payment statistics for a date range
   */
  getPaymentStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAmount: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  }>;
}
