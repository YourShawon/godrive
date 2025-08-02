/**
 * Email Service Interface
 *
 * Defines the contract for email sending operations
 * Handles password reset, email verification, and notification emails
 */

/**
 * Email Template Data Interface
 */
export interface EmailTemplateData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Email Send Result Interface
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Password Reset Email Data Interface
 */
export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
  resetUrl: string;
  expiresInMinutes: number;
}

/**
 * Email Verification Email Data Interface
 */
export interface EmailVerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
  verificationUrl: string;
  expiresInMinutes: number;
}

/**
 * Welcome Email Data Interface
 */
export interface WelcomeEmailData {
  email: string;
  name: string;
  verificationUrl?: string;
}

/**
 * Security Alert Email Data Interface
 */
export interface SecurityAlertEmailData {
  email: string;
  name: string;
  alertType:
    | "password_changed"
    | "login_from_new_device"
    | "account_locked"
    | "suspicious_activity";
  details: Record<string, any>;
  timestamp: Date;
}

/**
 * Email Service Interface
 * Handles all email sending operations
 */
export interface IEmailService {
  /**
   * Send password reset email
   * @param emailData - Password reset email data
   * @returns Promise<EmailSendResult> - Send result
   */
  sendPasswordResetEmail(
    emailData: PasswordResetEmailData
  ): Promise<EmailSendResult>;

  /**
   * Send email verification email
   * @param emailData - Email verification data
   * @returns Promise<EmailSendResult> - Send result
   */
  sendEmailVerificationEmail(
    emailData: EmailVerificationEmailData
  ): Promise<EmailSendResult>;

  /**
   * Send welcome email
   * @param emailData - Welcome email data
   * @returns Promise<EmailSendResult> - Send result
   */
  sendWelcomeEmail(emailData: WelcomeEmailData): Promise<EmailSendResult>;

  /**
   * Send security alert email
   * @param emailData - Security alert email data
   * @returns Promise<EmailSendResult> - Send result
   */
  sendSecurityAlertEmail(
    emailData: SecurityAlertEmailData
  ): Promise<EmailSendResult>;

  /**
   * Send custom email using template
   * @param templateData - Email template data
   * @returns Promise<EmailSendResult> - Send result
   */
  sendTemplatedEmail(templateData: EmailTemplateData): Promise<EmailSendResult>;

  /**
   * Test email service connection
   * @returns Promise<boolean> - Connection status
   */
  testConnection(): Promise<boolean>;

  /**
   * Validate email address format
   * @param email - Email address to validate
   * @returns boolean - Validation result
   */
  validateEmailAddress(email: string): boolean;
}

/**
 * Email Template Service Interface
 * Handles email template rendering
 */
export interface IEmailTemplateService {
  /**
   * Render email template
   * @param templateName - Template name
   * @param data - Template data
   * @returns Promise<{html: string, text: string}> - Rendered template
   */
  renderTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<{ html: string; text: string }>;

  /**
   * Check if template exists
   * @param templateName - Template name
   * @returns boolean - Template existence
   */
  templateExists(templateName: string): boolean;

  /**
   * Get available templates
   * @returns string[] - Array of template names
   */
  getAvailableTemplates(): string[];
}
