/**
 * Auth Service Utilities
 *
 * Shared utility functions for auth services to eliminate code duplication
 * and provide consistent patterns across all auth operations.
 */

import { User } from "@prisma/client";
import { logger } from "@utils/logger/config.js";
import { IPasswordService } from "../../interfaces/password.service.interface.js";

export class AuthServiceUtils {
  constructor(private readonly passwordService: IPasswordService) {}

  /**
   * Generate unique request ID for tracking operations
   */
  static generateRequestId(operation: string, identifier?: string): string {
    const timestamp = Date.now();
    const suffix = identifier ? `_${identifier}` : "";
    return `${operation}_${timestamp}${suffix}`;
  }

  /**
   * Hash token for secure storage using password service
   */
  async hashToken(token: string): Promise<string> {
    return await this.passwordService.hashPassword(token);
  }

  /**
   * Remove sensitive information from user object
   */
  static sanitizeUser(user: User): Omit<User, "password"> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Standard success logging with consistent format
   */
  static logSuccess(
    serviceName: string,
    operation: string,
    data: Record<string, any>,
    requestId?: string
  ): void {
    logger.info(`✅ [${serviceName}] ${operation} successful`, {
      ...data,
      ...(requestId && { requestId }),
      module: serviceName,
      action: `${operation.toLowerCase().replace(" ", "_")}_success`,
    });
  }

  /**
   * Standard error logging with consistent format
   */
  static logError(
    serviceName: string,
    operation: string,
    error: unknown,
    data?: Record<string, any>,
    requestId?: string
  ): void {
    logger.error(`❌ [${serviceName}] ${operation} failed`, {
      error: error instanceof Error ? error.message : "Unknown error",
      ...data,
      ...(requestId && { requestId }),
      module: serviceName,
      action: `${operation.toLowerCase().replace(" ", "_")}_error`,
    });
  }

  /**
   * Standard operation start logging
   */
  static logOperationStart(
    serviceName: string,
    operation: string,
    data?: Record<string, any>,
    requestId?: string
  ): void {
    logger.info(`🚀 [${serviceName}] ${operation} started`, {
      ...data,
      ...(requestId && { requestId }),
      module: serviceName,
      action: `${operation.toLowerCase().replace(" ", "_")}_start`,
    });
  }

  /**
   * Calculate token expiration date
   */
  static calculateTokenExpiration(days: number = 7): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Extract device info from request data
   */
  static extractDeviceInfo(requestData: any): {
    deviceInfo: string;
    ipAddress: string;
    userAgent: string;
  } {
    return {
      deviceInfo: requestData.deviceInfo || "Unknown Device",
      ipAddress: requestData.ipAddress || "Unknown IP",
      userAgent: requestData.userAgent || "Unknown User Agent",
    };
  }

  /**
   * Standardized error handling wrapper
   */
  static async executeWithErrorHandling<T>(
    serviceName: string,
    operation: string,
    asyncOperation: () => Promise<T>,
    requestId: string,
    additionalErrorData?: Record<string, any>
  ): Promise<T> {
    try {
      return await asyncOperation();
    } catch (error) {
      AuthServiceUtils.logError(
        serviceName,
        operation,
        error,
        additionalErrorData,
        requestId
      );
      throw error;
    }
  }
}
