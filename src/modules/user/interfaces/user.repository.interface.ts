// User Repository Interface - Database abstraction layer

import { User } from "@prisma/client";
import { CreateUserInput } from "../schemas/createUser.schema.js";

/**
 * Safe User type (excludes sensitive fields like password)
 */
export type SafeUser = Omit<User, "password">;

/**
 * Data required for user creation at repository level
 * Includes hashed password (security handled by service layer)
 */
export type CreateUserData = Omit<CreateUserInput, "password"> & {
  password: string; // Already hashed by service layer
};

/**
 * User Repository Interface
 * Defines the contract for user data access operations
 * This abstraction allows us to switch database implementations easily
 */
export interface IUserRepository {
  /**
   * Find a user by their MongoDB ObjectId
   * @param id - Valid MongoDB ObjectId string
   * @returns Promise<SafeUser | null> - User object or null if not found
   */
  findById(id: string): Promise<SafeUser | null>;

  /**
   * Find a user by their email address
   * Used for duplicate email checking during registration
   * @param email - Normalized email address (lowercase, trimmed)
   * @returns Promise<SafeUser | null> - User object or null if not found
   */
  findByEmail(email: string): Promise<SafeUser | null>;

  /**
   * Create a new user in the database
   * @param userData - User data with hashed password
   * @returns Promise<SafeUser> - Created user object (excludes password)
   * @throws Error - If email already exists or database operation fails
   */
  create(userData: CreateUserData): Promise<SafeUser>;

  // Future methods will be added here:
  // update(id: string, userData: UpdateUserData): Promise<SafeUser | null>;
  // delete(id: string): Promise<boolean>;
}
