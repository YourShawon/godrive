/**
 * Payment Service
 *
 * Business logic for payment operations
 */

import { logger } from "../../../utils/logger/config.js";
import { IPaymentRepository } from "../interfaces/payment.repository.interface.js";
import { IPaymentService } from "../interfaces/payment.service.interface.js";
import { stripeService } from "./stripe.service.js";
import {
  Payment,
  CreatePaymentData,
  PaymentIntentData,
  PaymentConfirmationResult,
  RefundRequestData,
  RefundResult,
  StripeWebhookEvent,
  PaymentStatus,
  PaymentProvider,
} from "../types/index.js";

export class PaymentService implements IPaymentService {
  constructor(private paymentRepository: IPaymentRepository) {}

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(paymentData: CreatePaymentData): Promise<{
    payment: Payment;
    paymentIntent: PaymentIntentData;
  }> {
    const traceId = `payment_service_create_intent_${Date.now()}`;

    try {
      logger.info("💳 PaymentService: Creating payment intent", {
        traceId,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency,
      });

      // Step 1: Create Stripe Payment Intent
      const paymentIntent =
        await stripeService.createPaymentIntent(paymentData);

      // Step 2: Create payment record in database
      const payment = await this.paymentRepository.create({
        ...paymentData,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          ...paymentData.metadata,
        },
      });

      // Step 3: Update payment with Stripe Payment Intent ID
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        providerPaymentId: paymentIntent.id,
        status: PaymentStatus.PENDING,
      });

      logger.info("✅ PaymentService: Payment intent created successfully", {
        traceId,
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentData.amount,
      });

      return {
        payment: updatedPayment!,
        paymentIntent,
      };
    } catch (error) {
      logger.error("❌ PaymentService: Error creating payment intent", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        paymentData: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          currency: paymentData.currency,
        },
      });
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    const traceId = `payment_service_get_${Date.now()}`;

    try {
      logger.info("🔍 PaymentService: Getting payment by ID", {
        traceId,
        paymentId: id,
      });

      const payment = await this.paymentRepository.findById(id);

      if (payment) {
        logger.info("✅ PaymentService: Payment found", {
          traceId,
          paymentId: payment.id,
          status: payment.status,
        });
      } else {
        logger.warn("⚠️ PaymentService: Payment not found", {
          traceId,
          paymentId: id,
        });
      }

      return payment;
    } catch (error) {
      logger.error("❌ PaymentService: Error getting payment", {
        traceId,
        paymentId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get payments for a booking
   */
  async getPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    const traceId = `payment_service_get_by_booking_${Date.now()}`;

    try {
      logger.info("📋 PaymentService: Getting payments by booking ID", {
        traceId,
        bookingId,
      });

      const payments = await this.paymentRepository.findByBookingId(bookingId);

      logger.info("✅ PaymentService: Payments retrieved", {
        traceId,
        bookingId,
        paymentsCount: payments.length,
      });

      return payments;
    } catch (error) {
      logger.error("❌ PaymentService: Error getting payments by booking", {
        traceId,
        bookingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Confirm payment success (usually called by webhook)
   */
  async confirmPayment(
    providerPaymentId: string
  ): Promise<PaymentConfirmationResult> {
    const traceId = `payment_service_confirm_${Date.now()}`;

    try {
      logger.info("✅ PaymentService: Confirming payment", {
        traceId,
        providerPaymentId,
      });

      // Find payment by provider payment ID
      const payment =
        await this.paymentRepository.findByProviderPaymentId(providerPaymentId);

      if (!payment) {
        logger.error("❌ PaymentService: Payment not found for confirmation", {
          traceId,
          providerPaymentId,
        });
        return {
          success: false,
          payment: null as any,
          error: "Payment not found",
        };
      }

      // Update payment status to succeeded
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.SUCCEEDED,
      });

      // TODO: Update booking status to confirmed
      // const booking = await bookingService.confirmBooking(payment.bookingId);

      logger.info("✅ PaymentService: Payment confirmed successfully", {
        traceId,
        paymentId: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
      });

      return {
        success: true,
        payment: updatedPayment!,
        // booking,
      };
    } catch (error) {
      logger.error("❌ PaymentService: Error confirming payment", {
        traceId,
        providerPaymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Handle payment failure (usually called by webhook)
   */
  async handlePaymentFailure(
    providerPaymentId: string,
    failureReason: string
  ): Promise<PaymentConfirmationResult> {
    const traceId = `payment_service_failure_${Date.now()}`;

    try {
      logger.info("❌ PaymentService: Handling payment failure", {
        traceId,
        providerPaymentId,
        failureReason,
      });

      // Find payment by provider payment ID
      const payment =
        await this.paymentRepository.findByProviderPaymentId(providerPaymentId);

      if (!payment) {
        logger.error(
          "❌ PaymentService: Payment not found for failure handling",
          {
            traceId,
            providerPaymentId,
          }
        );
        return {
          success: false,
          payment: null as any,
          error: "Payment not found",
        };
      }

      // Update payment status to failed
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
        failureReason,
      });

      // TODO: Update booking status or cancel booking
      // const booking = await bookingService.handlePaymentFailure(payment.bookingId);

      logger.info("✅ PaymentService: Payment failure handled", {
        traceId,
        paymentId: payment.id,
        bookingId: payment.bookingId,
        failureReason,
      });

      return {
        success: true,
        payment: updatedPayment!,
        error: failureReason,
      };
    } catch (error) {
      logger.error("❌ PaymentService: Error handling payment failure", {
        traceId,
        providerPaymentId,
        failureReason,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Process Stripe webhook events
   */
  async processStripeWebhook(event: StripeWebhookEvent): Promise<void> {
    const traceId = `payment_service_webhook_${Date.now()}`;

    try {
      logger.info("🔔 PaymentService: Processing Stripe webhook", {
        traceId,
        eventType: event.type,
        eventId: event.id,
      });

      const paymentIntent = event.data.object;

      switch (event.type) {
        case "payment_intent.succeeded":
          await this.confirmPayment(paymentIntent.id);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailure(
            paymentIntent.id,
            paymentIntent.last_payment_error?.message || "Payment failed"
          );
          break;

        case "payment_intent.canceled":
          await this.cancelPayment(paymentIntent.id);
          break;

        default:
          logger.info("ℹ️ PaymentService: Unhandled webhook event type", {
            traceId,
            eventType: event.type,
          });
      }

      logger.info("✅ PaymentService: Webhook processed successfully", {
        traceId,
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      logger.error("❌ PaymentService: Error processing webhook", {
        traceId,
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create refund for a payment
   */
  async createRefund(refundData: RefundRequestData): Promise<RefundResult> {
    const traceId = `payment_service_refund_${Date.now()}`;

    try {
      logger.info("💰 PaymentService: Creating refund", {
        traceId,
        paymentId: refundData.paymentId,
        amount: refundData.amount,
        reason: refundData.reason,
      });

      // Get original payment
      const payment = await this.paymentRepository.findById(
        refundData.paymentId
      );

      if (!payment) {
        return {
          success: false,
          refundId: "",
          amount: 0,
          payment: null as any,
          error: "Payment not found",
        };
      }

      // Create refund in Stripe
      const stripeRefund = await stripeService.createRefund(
        payment.providerPaymentId,
        refundData.amount,
        refundData.reason
      );

      // Update payment record
      const refundAmount = refundData.amount || payment.amount;
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status:
          refundAmount === payment.amount
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PARTIAL_REFUND,
        refundedAmount: (payment.refundedAmount || 0) + refundAmount,
      });

      logger.info("✅ PaymentService: Refund created successfully", {
        traceId,
        paymentId: payment.id,
        refundId: stripeRefund.id,
        refundAmount,
      });

      return {
        success: true,
        refundId: stripeRefund.id,
        amount: refundAmount,
        payment: updatedPayment!,
      };
    } catch (error) {
      logger.error("❌ PaymentService: Error creating refund", {
        traceId,
        paymentId: refundData.paymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        refundId: "",
        amount: 0,
        payment: null as any,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<Payment | null> {
    const traceId = `payment_service_cancel_${Date.now()}`;

    try {
      logger.info("🚫 PaymentService: Canceling payment", {
        traceId,
        paymentId,
      });

      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        logger.warn("⚠️ PaymentService: Payment not found for cancellation", {
          traceId,
          paymentId,
        });
        return null;
      }

      // Cancel in Stripe if it exists
      if (payment.providerPaymentId) {
        await stripeService.cancelPaymentIntent(payment.providerPaymentId);
      }

      // Update payment status
      const updatedPayment = await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.CANCELED,
      });

      logger.info("✅ PaymentService: Payment canceled successfully", {
        traceId,
        paymentId: payment.id,
      });

      return updatedPayment;
    } catch (error) {
      logger.error("❌ PaymentService: Error canceling payment", {
        traceId,
        paymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Retry a failed payment (create new payment intent)
   */
  async retryPayment(originalPaymentId: string): Promise<{
    payment: Payment;
    paymentIntent: PaymentIntentData;
  }> {
    const traceId = `payment_service_retry_${Date.now()}`;

    try {
      logger.info("🔄 PaymentService: Retrying payment", {
        traceId,
        originalPaymentId,
      });

      // Get original payment
      const originalPayment =
        await this.paymentRepository.findById(originalPaymentId);

      if (!originalPayment) {
        throw new Error("Original payment not found");
      }

      // Create new payment intent with same details
      const result = await this.createPaymentIntent({
        bookingId: originalPayment.bookingId,
        amount: originalPayment.amount,
        currency: originalPayment.currency,
        paymentMethod: originalPayment.paymentMethod,
        metadata: {
          ...originalPayment.metadata,
          originalPaymentId,
          retryAttempt: true,
        },
      });

      logger.info("✅ PaymentService: Payment retry created", {
        traceId,
        originalPaymentId,
        newPaymentId: result.payment.id,
        newStripeIntentId: result.paymentIntent.id,
      });

      return result;
    } catch (error) {
      logger.error("❌ PaymentService: Error retrying payment", {
        traceId,
        originalPaymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAmount: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  }> {
    const traceId = `payment_service_stats_${Date.now()}`;

    try {
      logger.info("📊 PaymentService: Getting payment statistics", {
        traceId,
        startDate,
        endDate,
      });

      const stats = await this.paymentRepository.getPaymentStats(
        startDate,
        endDate
      );

      logger.info("✅ PaymentService: Payment statistics retrieved", {
        traceId,
        ...stats,
      });

      return stats;
    } catch (error) {
      logger.error("❌ PaymentService: Error getting payment statistics", {
        traceId,
        startDate,
        endDate,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
