/**
 * Simple User Model
 * Starting with basic fields, will expand later
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

// For now, just basic user creation
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
}
