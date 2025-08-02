# Auth Module - Phase 1.3: Repository Layer

## 📁 Repository Structure

```
src/modules/auth/repositories/
├── interfaces/
│   ├── auth.repository.interface.ts      # Auth operations interface
│   └── refreshToken.repository.interface.ts # Token storage interface
├── implementations/
│   ├── auth.repository.ts                # Prisma-based auth repository
│   └── refreshToken.repository.ts        # Prisma-based token repository
└── index.ts                              # Repository exports
```

## 🛡️ Auth Repository (IAuthRepository)

### **User Authentication**

- `findUserByEmail()` - Authenticate user login
- `findUserById()` - Get user for token operations
- `createUser()` - Register new user account
- `updateUserPassword()` - Change user password
- `updateLastLogin()` - Track login activity

### **Account Verification**

- `createVerificationToken()` - Email verification tokens
- `findVerificationToken()` - Validate verification tokens
- `markVerificationTokenUsed()` - Prevent token reuse
- `verifyUserAccount()` - Activate user account

### **Password Reset**

- `createPasswordResetToken()` - Secure password reset
- `findPasswordResetToken()` - Validate reset tokens
- `markPasswordResetTokenUsed()` - One-time use tokens
- `cleanupExpiredPasswordResetTokens()` - Maintenance

### **Session Management**

- `createSession()` - User session tracking
- `findSession()` - Session validation
- `findUserSessions()` - Multi-device sessions
- `updateSessionAccess()` - Activity tracking
- `revokeSession()` / `revokeAllUserSessions()` - Logout
- `cleanupExpiredSessions()` - Maintenance

### **Security & Monitoring**

- `recordLoginAttempt()` - Track login attempts
- `getFailedLoginAttempts()` - Brute force protection
- `lockUserAccount()` / `unlockUserAccount()` - Account security
- `isAccountLocked()` - Check account status
- `cleanupExpiredAccountLocks()` - Maintenance

## 🔄 Refresh Token Repository (IRefreshTokenRepository)

### **Token Management**

- `storeRefreshToken()` - Secure token storage
- `findRefreshTokenByHash()` - Token lookup
- `findRefreshTokenById()` - Direct token access
- `findUserActiveTokens()` - User's active tokens
- `findAllUserTokens()` - Full token history

### **Token Validation**

- `isTokenValid()` - Validity check
- `updateTokenLastUsed()` - Activity tracking
- `validateAndUpdateToken()` - Combined operation

### **Token Revocation**

- `revokeRefreshToken()` - Single token revocation
- `revokeRefreshTokenByHash()` - Revoke by hash
- `revokeAllUserTokens()` - Logout all devices
- `revokeAllUserTokensExcept()` - Keep current session

### **Token Rotation**

- `rotateRefreshToken()` - Secure token rotation
- `batchRotateUserTokens()` - Bulk rotation

### **Token Cleanup**

- `cleanupExpiredRefreshTokens()` - Remove expired
- `cleanupOldRevokedTokens()` - Remove old revoked
- `cleanupOrphanedTokens()` - Remove user-less tokens

### **Token Analytics**

- `getTokenStatistics()` - Usage statistics
- `getTokenCountByDevice()` - Device tracking
- `findSuspiciousTokenActivity()` - Security monitoring

### **Security Features**

- `getTokensFromDifferentLocations()` - Location tracking
- `detectTokenReuseAttempt()` - Replay attack detection
- `lockUserTokensForSecurity()` - Emergency lockdown

## 🔧 Implementation Status

### ✅ **Completed**

- Repository interfaces with comprehensive contracts
- Prisma-based implementations with error handling
- Logging integration for all operations
- Type-safe data structures
- Security-first design patterns

### 🚧 **Database Schema Dependencies**

Most repository methods are **placeholder implementations** that will be completed when the following Prisma schema tables are added:

#### **Required Tables:**

```prisma
model VerificationToken {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  isUsed       Boolean  @default(false)
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  isUsed       Boolean  @default(false)
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id           String    @id @default(cuid())
  userId       String
  tokenHash    String    @unique
  deviceInfo   String?
  ipAddress    String?
  userAgent    String?
  isRevoked    Boolean   @default(false)
  expiresAt    DateTime
  lastUsedAt   DateTime?
  createdAt    DateTime  @default(now())
  revokedAt    DateTime?
  revokedReason String?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserSession {
  id              String   @id @default(cuid())
  userId          String
  sessionId       String   @unique
  deviceInfo      String?
  ipAddress       String?
  userAgent       String?
  isActive        Boolean  @default(true)
  expiresAt       DateTime
  lastAccessedAt  DateTime @default(now())
  createdAt       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LoginAttempt {
  id              String   @id @default(cuid())
  email           String
  ipAddress       String
  userAgent       String?
  isSuccessful    Boolean
  failureReason   String?
  attemptedAt     DateTime @default(now())
}

model AccountLock {
  id          String    @id @default(cuid())
  userId      String
  lockReason  String
  lockedAt    DateTime  @default(now())
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🎯 Next Steps

1. **Update Prisma Schema** - Add the required tables
2. **Complete Repository Implementations** - Replace placeholder methods
3. **Add Database Migrations** - Deploy schema changes
4. **Integration Testing** - Test repository operations
5. **Phase 1.4** - Implement main AuthService orchestrator

## 🔗 Integration Points

- **Services** → Use repositories for data operations
- **Prisma Client** → Injected into repository constructors
- **Error Handling** → Repositories throw service-specific errors
- **Logging** → Comprehensive operation logging
- **Type Safety** → Full TypeScript integration
