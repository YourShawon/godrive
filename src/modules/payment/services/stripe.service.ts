/**
 * Stripe Service
 *
 * Real Stripe SDK integration for payment processing
 */

import Stripe from "stripe";
import { logger } from "../../../utils/logger/config.js";
import {
  CreatePaymentData,
  PaymentIntentData,
  Currency,
  StripeWebhookEvent,
} from "../types/index.js";

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    // Initialize Stripe with API key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      logger.error("❌ STRIPE_SECRET_KEY environment variable is not set");
      throw new Error("Stripe secret key is required");
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-07-30.basil", // Use latest API version
      typescript: true,
    });

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    logger.info("✅ StripeService initialized with real Stripe SDK", {
      apiVersion: "2025-07-30.basil",
      hasWebhookSecret: !!this.webhookSecret,
    });
  }

  /**
   * Create a Stripe Payment Intent
   */
  async createPaymentIntent(
    paymentData: CreatePaymentData
  ): Promise<PaymentIntentData> {
    const traceId = `stripe_create_intent_${Date.now()}`;

    try {
      logger.info("💳 StripeService: Creating payment intent", {
        traceId,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency,
      });

      // Create Stripe Payment Intent with real SDK
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          bookingId: paymentData.bookingId,
          customerEmail: paymentData.customerEmail || "",
          customerName: paymentData.customerName || "",
          ...paymentData.metadata,
        },
      });

      logger.info("✅ Stripe payment intent created successfully", {
        traceId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || "",
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentData.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata || {},
      };
    } catch (error) {
      logger.error("❌ Error creating Stripe payment intent", {
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
   * Retrieve a Payment Intent from Stripe
   */
  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    const traceId = `stripe_get_intent_${Date.now()}`;

    try {
      logger.info("🔍 StripeService: Retrieving payment intent", {
        traceId,
        paymentIntentId,
      });

      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      logger.info("✅ Payment intent retrieved successfully", {
        traceId,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });

      return paymentIntent;
    } catch (error) {
      logger.error("❌ Error retrieving payment intent", {
        traceId,
        paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Confirm a Payment Intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    const traceId = `stripe_confirm_intent_${Date.now()}`;

    try {
      logger.info("✅ StripeService: Confirming payment intent", {
        traceId,
        paymentIntentId,
        hasPaymentMethod: !!paymentMethodId,
      });

      const confirmParams: Stripe.PaymentIntentConfirmParams = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      logger.info("✅ Payment intent confirmed successfully", {
        traceId,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      return paymentIntent;
    } catch (error) {
      logger.error("❌ Error confirming payment intent", {
        traceId,
        paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Cancel a Payment Intent
   */
  async cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    const traceId = `stripe_cancel_intent_${Date.now()}`;

    try {
      logger.info("🚫 StripeService: Canceling payment intent", {
        traceId,
        paymentIntentId,
      });

      const paymentIntent =
        await this.stripe.paymentIntents.cancel(paymentIntentId);

      logger.info("✅ Payment intent canceled successfully", {
        traceId,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      return paymentIntent;
    } catch (error) {
      logger.error("❌ Error canceling payment intent", {
        traceId,
        paymentIntentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    const traceId = `stripe_create_refund_${Date.now()}`;

    try {
      logger.info("💰 StripeService: Creating refund", {
        traceId,
        paymentIntentId,
        amount,
        reason,
      });

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      logger.info("✅ Refund created successfully", {
        traceId,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      });

      return refund;
    } catch (error) {
      logger.error("❌ Error creating refund", {
        traceId,
        paymentIntentId,
        amount,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Verify webhook signature and construct event
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): StripeWebhookEvent {
    const traceId = `stripe_verify_webhook_${Date.now()}`;

    try {
      logger.info("🔐 StripeService: Verifying webhook signature", {
        traceId,
        hasPayload: !!payload,
        hasSignature: !!signature,
        webhookSecretConfigured: !!this.webhookSecret,
      });

      if (!this.webhookSecret) {
        throw new Error("Webhook secret not configured");
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      ) as StripeWebhookEvent;

      logger.info("✅ Webhook signature verified successfully", {
        traceId,
        eventType: event.type,
        eventId: event.id,
      });

      return event;
    } catch (error) {
      logger.error("❌ Error verifying webhook signature", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    const traceId = `stripe_create_customer_${Date.now()}`;

    try {
      logger.info("👤 StripeService: Creating customer", {
        traceId,
        email,
        name,
      });

      const customerParams: Stripe.CustomerCreateParams = {
        email,
      };

      if (name) {
        customerParams.name = name;
      }

      if (metadata) {
        customerParams.metadata = metadata;
      }

      const customer = await this.stripe.customers.create(customerParams);

      logger.info("✅ Customer created successfully", {
        traceId,
        customerId: customer.id,
        email: customer.email,
      });

      return customer;
    } catch (error) {
      logger.error("❌ Error creating customer", {
        traceId,
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get Stripe account balance
   */
  async getBalance(): Promise<Stripe.Balance> {
    const traceId = `stripe_get_balance_${Date.now()}`;

    try {
      logger.info("💰 StripeService: Retrieving account balance", { traceId });

      const balance = await this.stripe.balance.retrieve();

      logger.info("✅ Account balance retrieved successfully", {
        traceId,
        available: balance.available,
        pending: balance.pending,
      });

      return balance;
    } catch (error) {
      logger.error("❌ Error retrieving account balance", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
