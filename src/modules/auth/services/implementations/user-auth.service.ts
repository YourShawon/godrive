/**
 * User Authentication Service
 *
 * Handles user registration and login operations.
 * Focused on core user authentication workflows.
 */

import { User } from "@prisma/client";
import { logger } from "@utils/logger/config.js";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenPayload,
} from "../../interfaces/auth.service.interface.js";
import { IAuthRepository } from "../../repositories/interfaces/auth.repository.interface.js";
import { IRefreshTokenRepository } from "../../repositories/interfaces/refreshToken.repository.interface.js";
import { ITokenService } from "../../interfaces/token.interface.js";
import { IPasswordService } from "../../interfaces/password.service.interface.js";
import { IValidationService } from "../../interfaces/validation.service.interface.js";
import { AuthenticationError } from "../../errors/AuthenticationError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { AuthServiceUtils } from "./auth-service.utils.js";

export class UserAuthService {
  private readonly utils: AuthServiceUtils;

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordService: IPasswordService,
    private readonly validationService: IValidationService
  ) {
    this.utils = new AuthServiceUtils(passwordService);
    logger.debug("👤 UserAuthService initialized");
  }

  // ==================== USER REGISTRATION ====================

  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    const requestId = AuthServiceUtils.generateRequestId(
      "register",
      registerData.email
    );

    AuthServiceUtils.logOperationStart(
      "UserAuthService",
      "Registration",
      {
        email: registerData.email,
      },
      requestId
    );

    return AuthServiceUtils.executeWithErrorHandling(
      "UserAuthService",
      "Registration",
      async () => {
        // Validate registration data
        await this.validateRegistrationData(registerData);

        // Check if user already exists
        await this.checkUserExists(registerData.email);

        // Create user
        const user = await this.createNewUser(registerData);

        // Generate and store tokens
        const tokens = await this.generateUserTokens(user, registerData);

        AuthServiceUtils.logSuccess(
          "UserAuthService",
          "Registration",
          {
            userId: user.id,
            email: registerData.email,
          },
          requestId
        );

        return {
          success: true,
          message: "Registration successful",
          user: AuthServiceUtils.sanitizeUser(user),
          tokens,
        };
      },
      requestId,
      { email: registerData.email }
    );
  } // ==================== USER LOGIN ====================

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const requestId = AuthServiceUtils.generateRequestId(
      "login",
      loginData.email
    );

    AuthServiceUtils.logOperationStart(
      "UserAuthService",
      "Login",
      {
        email: loginData.email,
      },
      requestId
    );

    return AuthServiceUtils.executeWithErrorHandling(
      "UserAuthService",
      "Login",
      async () => {
        // Validate login data
        await this.validateLoginData(loginData);

        // Authenticate user
        const user = await this.authenticateUser(loginData);

        // Generate and store tokens
        const tokens = await this.generateUserTokens(user, loginData);

        // Update user metadata
        await this.updateUserLogin(user.id);

        AuthServiceUtils.logSuccess(
          "UserAuthService",
          "Login",
          {
            userId: user.id,
            email: loginData.email,
          },
          requestId
        );

        return {
          success: true,
          message: "Login successful",
          user: AuthServiceUtils.sanitizeUser(user),
          tokens,
        };
      },
      requestId,
      { email: loginData.email }
    );
  } // ==================== PRIVATE HELPER METHODS ====================

  private async validateRegistrationData(data: RegisterRequest): Promise<void> {
    const validationResult =
      await this.validationService.validateRegistration(data);
    if (!validationResult.isValid) {
      throw new ValidationError(
        "Invalid registration data",
        validationResult.errors
      );
    }
  }

  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AuthenticationError("User already exists with this email");
    }
  }

  private async createNewUser(registerData: RegisterRequest): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      registerData.password
    );

    return await this.authRepository.createUser({
      email: registerData.email,
      password: hashedPassword,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phoneNumber: registerData.phoneNumber || "",
    });
  }

  private async validateLoginData(data: LoginRequest): Promise<void> {
    const validationResult = await this.validationService.validateLogin(data);
    if (!validationResult.isValid) {
      throw new ValidationError("Invalid login data", validationResult.errors);
    }
  }

  private async authenticateUser(loginData: LoginRequest): Promise<User> {
    // Find user
    const user = await this.authRepository.findUserByEmail(loginData.email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    return user;
  }

  private async generateUserTokens(
    user: User,
    requestData: RegisterRequest | LoginRequest
  ): Promise<any> {
    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.tokenService.generateTokenPair(tokenPayload);
    const deviceInfo = AuthServiceUtils.extractDeviceInfo(requestData);

    // Store refresh token
    await this.refreshTokenRepository.storeRefreshToken({
      userId: user.id,
      tokenHash: await this.utils.hashToken(tokens.refreshToken),
      deviceInfo: deviceInfo.deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      expiresAt: AuthServiceUtils.calculateTokenExpiration(7), // 7 days
    });

    return tokens;
  }

  private async updateUserLogin(userId: string): Promise<void> {
    await this.authRepository.updateLastLogin(userId);
  }
}
