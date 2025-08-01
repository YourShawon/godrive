/**
 * User Service - Clean Orchestrator Pattern
 *
 * Responsibilities:
 * - Implements IUserService interface
 * - Orchestrates operations between specialized services
 * - Handles HATEOAS response generation
 * - Maintains API contract compatibility
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Service orchestration only
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Depends on interfaces, not implementations
 */

import { logger } from "../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
} from "../interfaces/user.repository.interface.js";
import { IUserService } from "../interfaces/user.service.interface.js";
import { CreateUserInput } from "../schemas/createUser.schema.js";
import {
  UserHATEOAS,
  HATEOASResponse,
} from "../../../utils/hateoas/hateoas.utils.js";

// Import specialized services
import { createUserRetrievalService } from "./operations/userRetrieval.service.js";
import { createUserCreationService } from "./operations/userCreation.service.js";

export class UserService implements IUserService {
  private readonly retrievalService;
  private readonly creationService;

  constructor(private readonly userRepository: IUserRepository) {
    // Dependency injection of specialized services
    this.retrievalService = createUserRetrievalService(userRepository);
    this.creationService = createUserCreationService(userRepository);

    logger.info("🏗️ UserService initialized with specialized services", {
      module: "UserService",
      action: "constructor",
      services: ["UserRetrievalService", "UserCreationService"],
    });
  }

  /**
   * Get user by ID - delegates to retrieval service
   */
  async getUserById(id: string): Promise<SafeUser | null> {
    return this.retrievalService.getUserById(id);
  }

  /**
   * Get user by ID with HATEOAS links
   */
  async getUserByIdWithLinks(
    id: string
  ): Promise<HATEOASResponse<SafeUser> | null> {
    const startTime = Date.now();
    const correlationId = `getUserByIdWithLinks_${id}_${Date.now()}`;

    logger.info("🔗 [UserService] Starting getUserByIdWithLinks", {
      userId: id,
      correlationId,
      module: "UserService",
      action: "getUserByIdWithLinks_start",
    });

    try {
      const user = await this.getUserById(id);
      if (!user) return null;

      const links = UserHATEOAS.generateUserLinks(user.id, user.role);
      const response: HATEOASResponse<SafeUser> = {
        data: user,
        _links: links,
      };

      const duration = Date.now() - startTime;

      logger.info("✅ [UserService] HATEOAS response generated", {
        userId: id,
        linksCount: Object.keys(links).length,
        correlationId,
        duration: `${duration}ms`,
        module: "UserService",
        action: "getUserByIdWithLinks_success",
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserService] Error in getUserByIdWithLinks", {
        userId: id,
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UserService",
        action: "getUserByIdWithLinks_error",
      });

      throw error;
    }
  }

  /**
   * Create user - delegates to creation service
   */
  async createUser(userData: CreateUserInput): Promise<SafeUser> {
    return this.creationService.createUser(userData);
  }

  /**
   * Create user with HATEOAS links
   */
  async createUserWithLinks(
    userData: CreateUserInput
  ): Promise<HATEOASResponse<SafeUser>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.debug("🔗 [UserService] Starting createUserWithLinks", {
      email: userData.email,
      requestId,
      module: "UserService",
      action: "createUserWithLinks_start",
    });

    try {
      const user = await this.createUser(userData);
      const links = UserHATEOAS.generateUserLinks(user.id, user.role);

      const response: HATEOASResponse<SafeUser> = {
        data: user,
        _links: links,
      };

      logger.debug("🔗 [UserService] HATEOAS links generated", {
        userId: user.id,
        linksCount: Object.keys(response._links).length,
        requestId,
        module: "UserService",
        action: "createUserWithLinks_success",
      });

      return response;
    } catch (error) {
      logger.error("❌ [UserService] Error in createUserWithLinks", {
        email: userData.email,
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "UserService",
        action: "createUserWithLinks_error",
      });

      throw error;
    }
  }
}

// Export singleton instance with dependency injection
import { userRepository } from "../repositories/user.repository.js";
export const userService = new UserService(userRepository);
