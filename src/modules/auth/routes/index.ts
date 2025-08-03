/**
 * Auth Routes
 *
 * All authentication routes in one place
 */

import { Router } from "express";
import { register } from "../controllers/register.controller.js";
import { login } from "../controllers/login.controller.js";
import { logout } from "../controllers/logout.controller.js";

const router = Router();

/**
 * POST /auth/register
 * User registration endpoint
 *
 * @route POST /auth/register
 * @body {object} - Registration data
 * @body {string} email - User email address
 * @body {string} password - User password
 * @body {string} firstName - User first name
 * @body {string} lastName - User last name
 * @body {string} [phoneNumber] - Optional phone number
 * @returns {object} 201 - Registration success
 * @returns {object} 400 - Validation or authentication error
 * @returns {object} 500 - Server error
 */
router.post("/register", register);

/**
 * POST /auth/login
 * User login endpoint
 *
 * @route POST /auth/login
 * @body {object} - Login data
 * @body {string} email - User email address
 * @body {string} password - User password
 * @returns {object} 200 - Login success
 * @returns {object} 400 - Validation error
 * @returns {object} 401 - Authentication error
 * @returns {object} 500 - Server error
 */
router.post("/login", login);

/**
 * POST /auth/logout
 * User logout endpoint
 *
 * @route POST /auth/logout
 * @body {object} - Logout data
 * @body {string} userId - User ID
 * @body {string} [refreshToken] - Refresh token to invalidate
 * @body {string} [accessToken] - Access token to invalidate
 * @body {boolean} [logoutFromAllDevices] - Logout from all devices
 * @returns {object} 200 - Logout success
 * @returns {object} 400 - Validation error
 * @returns {object} 401 - Authentication error
 * @returns {object} 500 - Server error
 */
router.post("/logout", logout);

export { router as authRoutes };
