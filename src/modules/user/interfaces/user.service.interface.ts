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
import {
  UpdateUserInput,
  ChangePasswordInput,
} from "../schemas/updateUser.schema.js";

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

  /**
   * Update an existing user account
   *
   * Business Rules:
   * - Users can only update their own account (unless admin)
   * - Email changes require verification (future feature)
   * - Role changes restricted to admin users
   * - Password changes use separate endpoint for security
   * - Implements optimistic locking to prevent race conditions
   *
   * @param id - Valid MongoDB ObjectId of user to update
   * @param userData - Validated user update data (partial)
   * @param requesterId - ID of user making the request (for authorization)
   * @returns Promise<SafeUser> - Updated user object (excludes password)
   * @throws UserNotFoundError - If user doesn't exist
   * @throws UserUpdateForbiddenError - If unauthorized to update
   * @throws UserAlreadyExistsError - If email already exists (on email change)
   * @throws ServiceError - For system errors
   */
  updateUser(
    id: string,
    userData: UpdateUserInput,
    requesterId: string
  ): Promise<SafeUser>;

  /**
   * Update an existing user account with HATEOAS links
   *
   * Enhanced version that includes hypermedia links for Level 3 REST maturity.
   * Same business rules as updateUser but returns HATEOAS response.
   *
   * @param id - Valid MongoDB ObjectId of user to update
   * @param userData - Validated user update data (partial)
   * @param requesterId - ID of user making the request (for authorization)
   * @returns Promise<HATEOASResponse<SafeUser>> - Updated user with HATEOAS links
   * @throws Same errors as updateUser
   */
  updateUserWithLinks(
    id: string,
    userData: UpdateUserInput,
    requesterId: string
  ): Promise<HATEOASResponse<SafeUser>>;

  /**
   * Change user password with current password verification
   *
   * Business Rules:
   * - Must provide current password for verification
   * - New password must meet security requirements
   * - Users can only change their own password (unless admin)
   * - Logs password change events for security audit
   * - Invalidates existing sessions (future feature)
   *
   * @param id - Valid MongoDB ObjectId of user
   * @param passwordData - Current and new password data
   * @param requesterId - ID of user making the request
   * @returns Promise<boolean> - Success status
   * @throws UserNotFoundError - If user doesn't exist
   * @throws InvalidPasswordError - If current password is wrong
   * @throws UserUpdateForbiddenError - If unauthorized
   * @throws ServiceError - For system errors
   */
  changePassword(
    id: string,
    passwordData: ChangePasswordInput,
    requesterId: string
  ): Promise<boolean>;

  // Future service methods (following RESTful patterns):
  // getUserByEmail(email: string): Promise<SafeUser | null>;
  // updateUser(id: string, updates: UpdateUserData): Promise<SafeUser | null>;
  // deactivateUser(id: string): Promise<boolean>;
  // getUserPreferences(id: string): Promise<UserPreferences>;
}
