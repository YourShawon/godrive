/**
 * User Repository - Clean Orchestrator Pattern
 * 
 * Responsibilities:
 * - Implements IUserRepository interface
 * - Orchestrates operations between specialized repositories
 * - Maintains API contract compatibility
 * - Provides single entry point for data access
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Repository orchestration only
 * - Open/Closed: Extensible through composition
 * - Dependency Inversion: Depends on specialized repositories
 */

import { logger } from "../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
  CreateUserData,
} from "../interfaces/user.repository.interface.js";

// Import specialized repositories
import { createUserReadRepository } from "./operations/userRead.repository.js";
import { createUserWriteRepository } from "./operations/userWrite.repository.js";

export class UserRepository implements IUserRepository {
  private readonly readRepo;
  private readonly writeRepo;

  constructor() {
    // Dependency injection of specialized repositories
    this.readRepo = createUserReadRepository();
    this.writeRepo = createUserWriteRepository();

    logger.info("🏗️ UserRepository initialized with specialized repositories", {
      module: "UserRepository",
      action: "constructor",
      repositories: ["UserReadRepository", "UserWriteRepository"],
    });
  }

  /**
   * Find user by ID - delegates to read repository
   */
  async findById(id: string): Promise<SafeUser | null> {
    return this.readRepo.findById(id);
  }

  /**
   * Find user by email - delegates to read repository
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.readRepo.findByEmail(email);
  }

  /**
   * Create user - delegates to write repository
   */
  async create(userData: CreateUserData): Promise<SafeUser> {
    return this.writeRepo.create(userData);
  }

  // Future methods will delegate to appropriate specialized repositories:
  // async update(id: string, userData: UpdateUserData): Promise<SafeUser | null>
  // async delete(id: string): Promise<boolean>
  // async findMany(options: FindManyOptions): Promise<SafeUser[]>
  // async search(query: string): Promise<SafeUser[]>
}

// Export singleton instance
export const userRepository = new UserRepository();
