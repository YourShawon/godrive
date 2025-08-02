/**
 * Auth Module Interface Exports
 *
 * Central export file for all authentication-related interfaces
 * Provides easy import for services and controllers
 */

// Main service interfaces
export * from "./auth.service.interface.js";
export * from "./token.interface.js";
export * from "./auth.repository.interface.js";
export * from "./email.service.interface.js";

// Re-export relevant user interfaces for convenience
export type {
  SafeUser,
  IUserRepository,
  CreateUserData,
} from "../../user/interfaces/user.repository.interface.js";

export type { IUserService } from "../../user/interfaces/user.service.interface.js";
