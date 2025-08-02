// User Repository Interface - Database abstraction layer

import { User } from "@prisma/client";
import { CreateUserInput } from "../schemas/createUser.schema.js";
import { UpdateUserInput } from "../schemas/updateUser.schema.js";

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
 * Data shape for updating users in repository layer
 * All fields are optional since updates can be partial
 */
export type UpdateUserData = Partial<Omit<UpdateUserInput, "password">> & {
  password?: string; // Hashed password if being updated
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

  /**
   * Update an existing user in the database
   * @param id - MongoDB ObjectId of user to update
   * @param userData - Partial user data to update
   * @returns Promise<SafeUser | null> - Updated user object or null if not found
   * @throws Error - If email already exists (on email change) or database operation fails
   */
  update(id: string, userData: UpdateUserData): Promise<SafeUser | null>;

  /**
   * Update user password
   * @param id - MongoDB ObjectId of user
   * @param hashedPassword - New hashed password
   * @returns Promise<boolean> - Success status
   * @throws Error - If user not found or database operation fails
   */
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;

  // Future methods will be added here:
  // delete(id: string): Promise<boolean>;
}
