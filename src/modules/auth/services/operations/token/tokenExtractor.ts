/**
 * Token Extractor - Token Parsing Utilities
 *
 * Handles token extraction from headers and other sources
 * Single Responsibility: Token parsing and extraction utilities
 */

import { logger } from "../../../../../utils/logger/config.js";

export class TokenExtractor {
  constructor() {
    logger.debug("🔐 TokenExtractor initialized", {
      module: "TokenExtractor",
      action: "constructor",
    });
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    const requestId = `extractTokenFromHeader_${Date.now()}`;

    logger.debug("🔐 [TokenExtractor] Extracting token from header", {
      hasHeader: !!authHeader,
      requestId,
      module: "TokenExtractor",
      action: "extractTokenFromHeader_start",
    });

    try {
      if (!authHeader) {
        logger.debug("⚠️ [TokenExtractor] No authorization header provided", {
          requestId,
          module: "TokenExtractor",
          action: "extractTokenFromHeader_no_header",
        });
        return null;
      }

      // Expected format: "Bearer <token>"
      const bearerPrefix = "Bearer ";
      if (!authHeader.startsWith(bearerPrefix)) {
        logger.debug(
          "⚠️ [TokenExtractor] Invalid authorization header format",
          {
            headerStart: authHeader.substring(0, 10),
            requestId,
            module: "TokenExtractor",
            action: "extractTokenFromHeader_invalid_format",
          }
        );
        return null;
      }

      const token = authHeader.substring(bearerPrefix.length).trim();

      if (!token) {
        logger.debug(
          "⚠️ [TokenExtractor] Empty token in authorization header",
          {
            requestId,
            module: "TokenExtractor",
            action: "extractTokenFromHeader_empty_token",
          }
        );
        return null;
      }

      logger.debug("✅ [TokenExtractor] Token extracted successfully", {
        tokenLength: token.length,
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromHeader_success",
      });

      return token;
    } catch (error) {
      logger.error("❌ [TokenExtractor] Token extraction failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromHeader_error",
      });

      return null;
    }
  }

  /**
   * Extract token from cookie
   */
  extractTokenFromCookie(
    cookies: string,
    cookieName: string = "token"
  ): string | null {
    const requestId = `extractTokenFromCookie_${Date.now()}`;

    logger.debug("🔐 [TokenExtractor] Extracting token from cookie", {
      hasCookies: !!cookies,
      cookieName,
      requestId,
      module: "TokenExtractor",
      action: "extractTokenFromCookie_start",
    });

    try {
      if (!cookies) {
        logger.debug("⚠️ [TokenExtractor] No cookies provided", {
          requestId,
          module: "TokenExtractor",
          action: "extractTokenFromCookie_no_cookies",
        });
        return null;
      }

      // Parse cookies: "name1=value1; name2=value2"
      const cookieArray = cookies.split(";").map((cookie) => cookie.trim());

      for (const cookie of cookieArray) {
        const [name, value] = cookie.split("=");
        if (name === cookieName && value) {
          logger.debug("✅ [TokenExtractor] Token extracted from cookie", {
            cookieName,
            tokenLength: value.length,
            requestId,
            module: "TokenExtractor",
            action: "extractTokenFromCookie_success",
          });
          return value;
        }
      }

      logger.debug("⚠️ [TokenExtractor] Token cookie not found", {
        cookieName,
        availableCookies: cookieArray.map((c) => c.split("=")[0]),
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromCookie_not_found",
      });

      return null;
    } catch (error) {
      logger.error("❌ [TokenExtractor] Cookie token extraction failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromCookie_error",
      });

      return null;
    }
  }

  /**
   * Extract token from query parameter
   */
  extractTokenFromQuery(
    queryString: string,
    paramName: string = "token"
  ): string | null {
    const requestId = `extractTokenFromQuery_${Date.now()}`;

    logger.debug("🔐 [TokenExtractor] Extracting token from query", {
      hasQuery: !!queryString,
      paramName,
      requestId,
      module: "TokenExtractor",
      action: "extractTokenFromQuery_start",
    });

    try {
      if (!queryString) {
        logger.debug("⚠️ [TokenExtractor] No query string provided", {
          requestId,
          module: "TokenExtractor",
          action: "extractTokenFromQuery_no_query",
        });
        return null;
      }

      // Remove leading '?' if present
      const cleanQuery = queryString.startsWith("?")
        ? queryString.substring(1)
        : queryString;

      const params = new URLSearchParams(cleanQuery);
      const token = params.get(paramName);

      if (token) {
        logger.debug("✅ [TokenExtractor] Token extracted from query", {
          paramName,
          tokenLength: token.length,
          requestId,
          module: "TokenExtractor",
          action: "extractTokenFromQuery_success",
        });
        return token;
      }

      logger.debug("⚠️ [TokenExtractor] Token parameter not found in query", {
        paramName,
        availableParams: Array.from(params.keys()),
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromQuery_not_found",
      });

      return null;
    } catch (error) {
      logger.error("❌ [TokenExtractor] Query token extraction failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "TokenExtractor",
        action: "extractTokenFromQuery_error",
      });

      return null;
    }
  }

  /**
   * Extract token from multiple sources (priority order)
   */
  extractToken(sources: {
    authHeader?: string;
    cookies?: string;
    query?: string;
    cookieName?: string;
    queryParam?: string;
  }): { token: string | null; source: string | null } {
    const requestId = `extractToken_${Date.now()}`;

    logger.debug("🔐 [TokenExtractor] Extracting token from multiple sources", {
      hasAuthHeader: !!sources.authHeader,
      hasCookies: !!sources.cookies,
      hasQuery: !!sources.query,
      requestId,
      module: "TokenExtractor",
      action: "extractToken_start",
    });

    // Priority order: Authorization header > Cookie > Query parameter

    // 1. Try Authorization header first (most secure)
    if (sources.authHeader) {
      const token = this.extractTokenFromHeader(sources.authHeader);
      if (token) {
        logger.debug(
          "✅ [TokenExtractor] Token found in authorization header",
          {
            requestId,
            module: "TokenExtractor",
            action: "extractToken_header_success",
          }
        );
        return { token, source: "header" };
      }
    }

    // 2. Try cookie
    if (sources.cookies) {
      const token = this.extractTokenFromCookie(
        sources.cookies,
        sources.cookieName || "token"
      );
      if (token) {
        logger.debug("✅ [TokenExtractor] Token found in cookie", {
          requestId,
          module: "TokenExtractor",
          action: "extractToken_cookie_success",
        });
        return { token, source: "cookie" };
      }
    }

    // 3. Try query parameter (least secure, for special cases)
    if (sources.query) {
      const token = this.extractTokenFromQuery(
        sources.query,
        sources.queryParam || "token"
      );
      if (token) {
        logger.debug("✅ [TokenExtractor] Token found in query parameter", {
          requestId,
          module: "TokenExtractor",
          action: "extractToken_query_success",
        });
        return { token, source: "query" };
      }
    }

    logger.debug("⚠️ [TokenExtractor] No token found in any source", {
      requestId,
      module: "TokenExtractor",
      action: "extractToken_not_found",
    });

    return { token: null, source: null };
  }
}
