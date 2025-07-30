/**
 * Mock User Data
 * Simple mock users for testing before database integration
 */

import { User } from "./models/User.js";

// Mock user database
export const mockUsers: { [key: string]: User } = {
  "507f1f77bcf86cd799439011": {
    id: "507f1f77bcf86cd799439011",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2025-01-15T10:30:00.000Z",
  },
  "507f1f77bcf86cd799439012": {
    id: "507f1f77bcf86cd799439012",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    createdAt: "2025-01-20T14:20:00.000Z",
  },
  "507f1f77bcf86cd799439013": {
    id: "507f1f77bcf86cd799439013",
    email: "admin@godrive.com",
    firstName: "Admin",
    lastName: "User",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
};

// Simple function to get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockUsers[id] || null;
};
