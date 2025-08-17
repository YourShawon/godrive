/**
 * Payment Module Types
 *
 * TypeScript types and interfaces for the payment module
 */

import {
  Payment as PrismaPayment,
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
} from "@prisma/client";

// Re-export Prisma types
export { PaymentStatus, PaymentMethod, PaymentProvider };

// Use Prisma-generated Payment type
export type Payment = PrismaPayment;

// Currency enum (not in Prisma, so we keep it separate)
export enum Currency {
  USD = "usd",
  EUR = "eur",
  GBP = "gbp",
  CAD = "cad",
  AUD = "aud",
}

// Create payment input
export interface CreatePaymentData {
  bookingId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
  customerEmail?: string;
  customerName?: string;
}

// Update payment input
export interface UpdatePaymentData {
  status?: PaymentStatus;
  providerPaymentId?: string;
  providerCustomerId?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  refundedAmount?: number;
}

// Payment intent data from Stripe
export interface PaymentIntentData {
  id: string; // Stripe Payment Intent ID
  clientSecret: string; // For frontend
  amount: number;
  currency: Currency;
  status: string;
  metadata: Record<string, any>;
}

// Stripe webhook event data
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Payment confirmation result
export interface PaymentConfirmationResult {
  success: boolean;
  payment: Payment;
  booking?: any; // Booking entity
  error?: string;
}

// Refund request data
export interface RefundRequestData {
  paymentId: string;
  amount?: number; // Optional for partial refunds
  reason?: string;
  metadata?: Record<string, any>;
}

// Refund result
export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  payment: Payment;
  error?: string;
}
