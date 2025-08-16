/**
 * Payment Service Interface
 *
 * Defines the contract for payment business logic operations
 */

import {
  Payment,
  CreatePaymentData,
  PaymentIntentData,
  PaymentConfirmationResult,
  RefundRequestData,
  RefundResult,
  StripeWebhookEvent,
} from "../types/index.js";

export interface IPaymentService {
  /**
   * Create a payment intent for a booking
   * This creates both the payment record and Stripe Payment Intent
   */
  createPaymentIntent(paymentData: CreatePaymentData): Promise<{
    payment: Payment;
    paymentIntent: PaymentIntentData;
  }>;

  /**
   * Get payment by ID
   */
  getPaymentById(id: string): Promise<Payment | null>;

  /**
   * Get payments for a booking
   */
  getPaymentsByBookingId(bookingId: string): Promise<Payment[]>;

  /**
   * Confirm payment success (usually called by webhook)
   */
  confirmPayment(providerPaymentId: string): Promise<PaymentConfirmationResult>;

  /**
   * Handle payment failure (usually called by webhook)
   */
  handlePaymentFailure(
    providerPaymentId: string,
    failureReason: string
  ): Promise<PaymentConfirmationResult>;

  /**
   * Process Stripe webhook events
   */
  processStripeWebhook(event: StripeWebhookEvent): Promise<void>;

  /**
   * Create refund for a payment
   */
  createRefund(refundData: RefundRequestData): Promise<RefundResult>;

  /**
   * Cancel a pending payment
   */
  cancelPayment(paymentId: string): Promise<Payment | null>;

  /**
   * Retry a failed payment (create new payment intent)
   */
  retryPayment(originalPaymentId: string): Promise<{
    payment: Payment;
    paymentIntent: PaymentIntentData;
  }>;

  /**
   * Get payment statistics
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
