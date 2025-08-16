/**
 * Payment Module Types
 *
 * TypeScript types and interfaces for the payment module
 */

// Payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
}

// Payment method enum
export enum PaymentMethod {
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  DIGITAL_WALLET = "digital_wallet",
}

// Payment provider enum
export enum PaymentProvider {
  STRIPE = "stripe",
}

// Currency enum
export enum Currency {
  USD = "usd",
  EUR = "eur",
  GBP = "gbp",
  CAD = "cad",
  AUD = "aud",
}

// Base payment entity
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  providerPaymentId: string; // Stripe Payment Intent ID
  providerCustomerId?: string; // Stripe Customer ID
  metadata: Record<string, any>;
  failureReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
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
