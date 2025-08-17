/**
 * Payment Repository
 *
 * Data access layer for payment operations
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";
import { IPaymentRepository } from "../interfaces/payment.repository.interface.js";
import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentStatus as CustomPaymentStatus,
} from "../types/index.js";
import {
  Payment as PrismaPayment,
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
} from "@prisma/client";

export class PaymentRepository implements IPaymentRepository {
  /**
   * Create a new payment record
   */
  async create(paymentData: CreatePaymentData): Promise<Payment> {
    try {
      logger.info("🔍 PaymentRepository: Creating payment", {
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency,
      });

      const payment = await prisma.payment.create({
        data: {
          bookingId: paymentData.bookingId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethod: paymentData.paymentMethod as PaymentMethod,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          metadata: paymentData.metadata || {},
          customerEmail: paymentData.customerEmail || null,
          customerName: paymentData.customerName || null,
        },
      });

      logger.info("✅ Payment created successfully", {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
      });

      return payment as Payment;
    } catch (error) {
      logger.error("❌ Error creating payment", {
        bookingId: paymentData.bookingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find a payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    try {
      logger.info("🔍 PaymentRepository: Finding payment by ID", {
        paymentId: id,
      });

      const payment = await prisma.payment.findUnique({
        where: { id },
        // Temporarily commented out booking include for testing since we don't have real bookings
        // include: {
        //   booking: {
        //     select: {
        //       id: true,
        //       carId: true,
        //       userId: true,
        //       status: true,
        //       startDate: true,
        //       endDate: true,
        //       totalAmount: true,
        //     },
        //   },
        // },
      });

      if (payment) {
        logger.info("✅ Payment found", {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount,
        });
      } else {
        logger.warn("⚠️ Payment not found", { paymentId: id });
      }

      return payment as Payment | null;
    } catch (error) {
      logger.error("❌ Error finding payment by ID", {
        paymentId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find a payment by provider payment ID (e.g., Stripe Payment Intent ID)
   */
  async findByProviderPaymentId(
    providerPaymentId: string
  ): Promise<Payment | null> {
    try {
      logger.info("🔍 PaymentRepository: Finding payment by provider ID", {
        providerPaymentId,
      });

      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId },
        include: {
          booking: {
            select: {
              id: true,
              carId: true,
              userId: true,
              status: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
            },
          },
        },
      });

      if (payment) {
        logger.info("✅ Payment found by provider ID", {
          paymentId: payment.id,
          providerPaymentId: payment.providerPaymentId,
          status: payment.status,
        });
      } else {
        logger.warn("⚠️ Payment not found by provider ID", {
          providerPaymentId,
        });
      }

      return payment as Payment | null;
    } catch (error) {
      logger.error("❌ Error finding payment by provider ID", {
        providerPaymentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find payments by booking ID
   */
  async findByBookingId(bookingId: string): Promise<Payment[]> {
    try {
      logger.info("🔍 PaymentRepository: Finding payments by booking ID", {
        bookingId,
      });

      const payments = await prisma.payment.findMany({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              carId: true,
              userId: true,
              status: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
            },
          },
        },
      });

      logger.info("✅ Payments found by booking ID", {
        bookingId,
        paymentsCount: payments.length,
      });

      return payments as Payment[];
    } catch (error) {
      logger.error("❌ Error finding payments by booking ID", {
        bookingId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Find payments by status
   */
  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    try {
      logger.info("🔍 PaymentRepository: Finding payments by status", {
        status,
      });

      const payments = await prisma.payment.findMany({
        where: { status },
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              carId: true,
              userId: true,
              status: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
            },
          },
        },
      });

      logger.info("✅ Payments found by status", {
        status,
        paymentsCount: payments.length,
      });

      return payments as Payment[];
    } catch (error) {
      logger.error("❌ Error finding payments by status", {
        status,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update a payment by ID
   */
  async update(
    id: string,
    paymentData: UpdatePaymentData
  ): Promise<Payment | null> {
    try {
      logger.info("🔄 PaymentRepository: Updating payment", {
        paymentId: id,
        updateFields: Object.keys(paymentData),
      });

      // Build update object with only provided fields
      const data: any = {};

      if (paymentData.status !== undefined) data.status = paymentData.status;
      if (paymentData.providerPaymentId !== undefined)
        data.providerPaymentId = paymentData.providerPaymentId;
      if (paymentData.providerCustomerId !== undefined)
        data.providerCustomerId = paymentData.providerCustomerId;
      if (paymentData.metadata !== undefined)
        data.metadata = paymentData.metadata;
      if (paymentData.failureReason !== undefined)
        data.failureReason = paymentData.failureReason;
      if (paymentData.refundedAmount !== undefined)
        data.refundedAmount = paymentData.refundedAmount;

      const payment = await prisma.payment.update({
        where: { id },
        data,
        include: {
          booking: {
            select: {
              id: true,
              carId: true,
              userId: true,
              status: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
            },
          },
        },
      });

      logger.info("✅ Payment updated successfully", {
        paymentId: payment.id,
        updatedFields: Object.keys(data),
        newStatus: payment.status,
      });

      return payment as Payment;
    } catch (error) {
      // Handle Prisma "record not found" error
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        logger.warn("⚠️ Payment not found for update", { paymentId: id });
        return null;
      }

      logger.error("❌ Error updating payment", {
        paymentId: id,
        updateData: Object.keys(paymentData),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update payment by provider payment ID
   */
  async updateByProviderPaymentId(
    providerPaymentId: string,
    paymentData: UpdatePaymentData
  ): Promise<Payment | null> {
    try {
      logger.info("🔄 PaymentRepository: Updating payment by provider ID", {
        providerPaymentId,
        updateFields: Object.keys(paymentData),
      });

      // First find the payment to get its ID
      const existingPayment =
        await this.findByProviderPaymentId(providerPaymentId);

      if (!existingPayment) {
        logger.warn("⚠️ Payment not found by provider ID for update", {
          providerPaymentId,
        });
        return null;
      }

      // Use the regular update method
      return await this.update(existingPayment.id, paymentData);
    } catch (error) {
      logger.error("❌ Error updating payment by provider ID", {
        providerPaymentId,
        updateData: Object.keys(paymentData),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Delete a payment by ID (soft delete recommended)
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.info("🗑️ PaymentRepository: Deleting payment", { paymentId: id });

      // Soft delete by updating status instead of actual deletion
      const deletedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.CANCELED,
          metadata: {
            deletedAt: new Date().toISOString(),
            deletedReason: "soft_delete",
          },
        },
      });

      logger.info("✅ Payment soft deleted successfully", {
        paymentId: deletedPayment.id,
      });

      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        logger.warn("⚠️ Payment not found for deletion", { paymentId: id });
        return false;
      }

      logger.error("❌ Error deleting payment", {
        paymentId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Check if a payment exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      logger.info("🔍 PaymentRepository: Checking if payment exists", {
        paymentId: id,
      });

      const payment = await prisma.payment.findUnique({
        where: { id },
        select: { id: true },
      });

      const exists = !!payment;

      logger.info("✅ Payment existence check completed", {
        paymentId: id,
        exists,
      });

      return exists;
    } catch (error) {
      logger.error("❌ Error checking payment existence", {
        paymentId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get payment statistics for a date range
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
    try {
      logger.info("📊 PaymentRepository: Getting payment statistics", {
        startDate,
        endDate,
      });

      const [totalStats, successfulStats, failedStats, refundStats] =
        await Promise.all([
          // Total payments and amount
          prisma.payment.aggregate({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _count: { id: true },
            _sum: { amount: true },
          }),

          // Successful payments count
          prisma.payment.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: PaymentStatus.SUCCEEDED,
            },
          }),

          // Failed payments count
          prisma.payment.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: PaymentStatus.FAILED,
            },
          }),

          // Refunded amount
          prisma.payment.aggregate({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                in: [PaymentStatus.REFUNDED, PaymentStatus.PARTIAL_REFUND],
              },
            },
            _sum: { refundedAmount: true },
          }),
        ]);

      const stats = {
        totalAmount: totalStats._sum.amount || 0,
        totalPayments: totalStats._count.id || 0,
        successfulPayments: successfulStats || 0,
        failedPayments: failedStats || 0,
        refundedAmount: refundStats._sum.refundedAmount || 0,
      };

      logger.info("✅ Payment statistics retrieved", {
        startDate,
        endDate,
        ...stats,
      });

      return stats;
    } catch (error) {
      logger.error("❌ Error getting payment statistics", {
        startDate,
        endDate,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export singleton instance
export const paymentRepository = new PaymentRepository();
