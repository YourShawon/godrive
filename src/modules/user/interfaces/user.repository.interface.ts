// User Repository Interface - Database abstraction layer

import { User } from "@prisma/client";

/**
 * Safe User type (excludes sensitive fields like password)
 */
export type SafeUser = Omit<User, "password">;

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

  // Future methods will be added here:
  // findByEmail(email: string): Promise<SafeUser | null>;
  // create(userData: CreateUserData): Promise<SafeUser>;
  // update(id: string, userData: UpdateUserData): Promise<SafeUser | null>;
  // delete(id: string): Promise<boolean>;
}
