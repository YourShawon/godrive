/**
 * Refresh Token Repository Interface
 *
 * Handles refresh token storage, validation, and management
 * Provides secure token persistence with rotation capabilities
 */

/**
 * Refresh Token Data Interface
 */
export interface RefreshTokenData {
  tokenId: string;
  userId: string;
  tokenHash: string; // Hashed version of the token for security
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

/**
 * Refresh Token Creation Data Interface
 */
export interface RefreshTokenCreationData {
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

/**
 * Token Rotation Data Interface
 */
export interface TokenRotationData {
  oldTokenId: string;
  newTokenData: RefreshTokenCreationData;
  rotationReason?: string;
}

/**
 * Token Statistics Interface
 */
export interface TokenStatistics {
  totalTokens: number;
  activeTokens: number;
  revokedTokens: number;
  expiredTokens: number;
  tokensCreatedToday: number;
  tokensRevokedToday: number;
}

/**
 * Refresh Token Repository Interface
 * Handles all refresh token database operations
 */
export interface IRefreshTokenRepository {
  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Store new refresh token
   * @param tokenData - Refresh token creation data
   * @returns Promise<string> - Token ID
   */
  storeRefreshToken(tokenData: RefreshTokenCreationData): Promise<string>;

  /**
   * Find refresh token by token hash
   * @param tokenHash - Hashed token value
   * @returns Promise<RefreshTokenData | null> - Token data or null
   */
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenData | null>;

  /**
   * Find refresh token by token ID
   * @param tokenId - Token ID
   * @returns Promise<RefreshTokenData | null> - Token data or null
   */
  findRefreshTokenById(tokenId: string): Promise<RefreshTokenData | null>;

  /**
   * Find all active refresh tokens for user
   * @param userId - User ID
   * @returns Promise<RefreshTokenData[]> - Array of active tokens
   */
  findUserActiveTokens(userId: string): Promise<RefreshTokenData[]>;

  /**
   * Find all refresh tokens for user (including revoked)
   * @param userId - User ID
   * @returns Promise<RefreshTokenData[]> - Array of all user tokens
   */
  findAllUserTokens(userId: string): Promise<RefreshTokenData[]>;

  // ==================== TOKEN VALIDATION ====================

  /**
   * Check if token is valid (not revoked, not expired)
   * @param tokenHash - Hashed token value
   * @returns Promise<boolean> - Validity status
   */
  isTokenValid(tokenHash: string): Promise<boolean>;

  /**
   * Update token last used timestamp
   * @param tokenId - Token ID
   * @returns Promise<boolean> - Success status
   */
  updateTokenLastUsed(tokenId: string): Promise<boolean>;

  /**
   * Validate token and update last used time
   * @param tokenHash - Hashed token value
   * @returns Promise<RefreshTokenData | null> - Token data if valid
   */
  validateAndUpdateToken(tokenHash: string): Promise<RefreshTokenData | null>;

  // ==================== TOKEN REVOCATION ====================

  /**
   * Revoke refresh token
   * @param tokenId - Token ID
   * @param reason - Revocation reason
   * @returns Promise<boolean> - Success status
   */
  revokeRefreshToken(tokenId: string, reason?: string): Promise<boolean>;

  /**
   * Revoke refresh token by hash
   * @param tokenHash - Hashed token value
   * @param reason - Revocation reason
   * @returns Promise<boolean> - Success status
   */
  revokeRefreshTokenByHash(
    tokenHash: string,
    reason?: string
  ): Promise<boolean>;

  /**
   * Revoke all refresh tokens for user
   * @param userId - User ID
   * @param reason - Revocation reason
   * @returns Promise<number> - Number of revoked tokens
   */
  revokeAllUserTokens(userId: string, reason?: string): Promise<number>;

  /**
   * Revoke all tokens except specified one
   * @param userId - User ID
   * @param excludeTokenId - Token ID to keep active
   * @param reason - Revocation reason
   * @returns Promise<number> - Number of revoked tokens
   */
  revokeAllUserTokensExcept(
    userId: string,
    excludeTokenId: string,
    reason?: string
  ): Promise<number>;

  // ==================== TOKEN ROTATION ====================

  /**
   * Rotate refresh token (revoke old, create new)
   * @param rotationData - Token rotation data
   * @returns Promise<string> - New token ID
   */
  rotateRefreshToken(rotationData: TokenRotationData): Promise<string>;

  /**
   * Batch rotate tokens for user
   * @param userId - User ID
   * @param newTokensData - Array of new token data
   * @param reason - Rotation reason
   * @returns Promise<string[]> - Array of new token IDs
   */
  batchRotateUserTokens(
    userId: string,
    newTokensData: RefreshTokenCreationData[],
    reason?: string
  ): Promise<string[]>;

  // ==================== TOKEN CLEANUP ====================

  /**
   * Clean up expired refresh tokens
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupExpiredRefreshTokens(): Promise<number>;

  /**
   * Clean up revoked tokens older than specified days
   * @param daysOld - Number of days
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupOldRevokedTokens(daysOld: number): Promise<number>;

  /**
   * Clean up all tokens for deleted users
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupOrphanedTokens(): Promise<number>;

  // ==================== TOKEN ANALYTICS ====================

  /**
   * Get token statistics
   * @param userId - Optional user ID for user-specific stats
   * @returns Promise<TokenStatistics> - Token statistics
   */
  getTokenStatistics(userId?: string): Promise<TokenStatistics>;

  /**
   * Get token count by device
   * @param userId - User ID
   * @returns Promise<Record<string, number>> - Device token counts
   */
  getTokenCountByDevice(userId: string): Promise<Record<string, number>>;

  /**
   * Find suspicious token activity
   * @param userId - User ID
   * @param timeWindow - Time window in hours
   * @returns Promise<RefreshTokenData[]> - Suspicious tokens
   */
  findSuspiciousTokenActivity(
    userId: string,
    timeWindow: number
  ): Promise<RefreshTokenData[]>;

  // ==================== SECURITY FEATURES ====================

  /**
   * Get tokens created from different locations
   * @param userId - User ID
   * @param timeWindow - Time window in hours
   * @returns Promise<RefreshTokenData[]> - Tokens from different IPs
   */
  getTokensFromDifferentLocations(
    userId: string,
    timeWindow: number
  ): Promise<RefreshTokenData[]>;

  /**
   * Detect token reuse attempts
   * @param tokenHash - Hashed token value
   * @returns Promise<boolean> - True if reuse detected
   */
  detectTokenReuseAttempt(tokenHash: string): Promise<boolean>;

  /**
   * Lock user tokens due to security breach
   * @param userId - User ID
   * @param reason - Lock reason
   * @returns Promise<number> - Number of locked tokens
   */
  lockUserTokensForSecurity(userId: string, reason: string): Promise<number>;
}
