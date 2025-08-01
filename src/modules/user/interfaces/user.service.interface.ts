/**
 * User Service Interface - Business Logic Contract
 *
 * This interface defines the business operations for user management.
 * contract-first development with clear separation of concerns.
 * Now includes HATEOAS support for Level 3 REST maturity.
 */

import { SafeUser } from "../interfaces/user.repository.interface.js";
import { HATEOASResponse } from "../../../utils/hateoas/hateoas.utils.js";
import {
  CreateUserInput,
  CreateUserResponse,
} from "../schemas/createUser.schema.js";

/**
 * User Service Interface
 * Defines business logic operations for user management
 *
 * Why interface first?
 * - Enables dependency injection for testing
 * - Clear contract definition before implementation
 * - Allows multiple implementations (e.g., with/without caching)
 * - Follows SOLID principles (Interface Segregation)
 */
export interface IUserService {
  /**
   * Retrieve a user by their MongoDB ObjectId
   *
   * Business Rules:
   * - Only returns active users (future: soft delete check)
   * - Excludes sensitive information (password, tokens)
   * - Implements caching for performance
   * - Logs business events for analytics
   *
   * @param id - Valid MongoDB ObjectId (pre-validated by middleware)
   * @returns Promise<SafeUser | null> - User object or null if not found/inactive
   * @throws ServiceError - For business logic violations or system errors
   */
  getUserById(id: string): Promise<SafeUser | null>;

  /**
   * Retrieve a user by their MongoDB ObjectId with HATEOAS links
   *
   * Enhanced version that includes hypermedia links for Level 3 REST maturity.
   * Provides self-descriptive API responses with available actions.
   *
   * @param id - Valid MongoDB ObjectId (pre-validated by middleware)
   * @returns Promise<HATEOASResponse<SafeUser> | null> - User with HATEOAS links or null
   * @throws ServiceError - For business logic violations or system errors
   */
  getUserByIdWithLinks(id: string): Promise<HATEOASResponse<SafeUser> | null>;

  /**
   * Create a new user account
   *
   * Business Rules:
   * - Email must be unique across the system
   * - Password must meet security requirements (handled by validation)
   * - Password is hashed before storage (bcrypt)
   * - Default role is CUSTOMER unless specified
   * - Implements cache warming for new user
   * - Logs user registration events
   *
   * @param userData - Validated user creation data
   * @returns Promise<SafeUser> - Created user object (excludes password)
   * @throws UserAlreadyExistsError - If email already exists
   * @throws InvalidUserDataError - If business rules are violated
   * @throws ServiceError - For system errors
   */
  createUser(userData: CreateUserInput): Promise<SafeUser>;

  /**
   * Create a new user account with HATEOAS links
   *
   * Enhanced version that includes hypermedia links for Level 3 REST maturity.
   * Provides self-descriptive API responses with available actions.
   *
   * @param userData - Validated user creation data
   * @returns Promise<HATEOASResponse<SafeUser>> - Created user with HATEOAS links
   * @throws UserAlreadyExistsError - If email already exists
   * @throws InvalidUserDataError - If business rules are violated
   * @throws ServiceError - For system errors
   */
  createUserWithLinks(
    userData: CreateUserInput
  ): Promise<HATEOASResponse<SafeUser>>;

  // Future service methods (following RESTful patterns):
  // getUserByEmail(email: string): Promise<SafeUser | null>;
  // updateUser(id: string, updates: UpdateUserData): Promise<SafeUser | null>;
  // deactivateUser(id: string): Promise<boolean>;
  // getUserPreferences(id: string): Promise<UserPreferences>;
}
