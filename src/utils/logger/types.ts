// 🎯 Logger Type Definitions - Centralized type safety

export interface LogContext {
  // User-related fields
  userId?: string;
  requesterId?: string;
  requesterRole?: string;

  // Sensitive fields (will be redacted automatically)
  email?: string;
  password?: string;
  phoneNumber?: string;

  // HTTP-related fields
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  status?: number;
  responseTime?: string;

  // Validation and errors
  errors?: any[];
  updatedFields?: string[];

  // Database operations
  query?: string;
  parameters?: any[];
  duration?: string;

  // Cache operations
  cacheKey?: string;
  cacheKeys?: string[];
  count?: number;

  // Flexible for future needs
  [key: string]: any;
}

// 🎯 Structured log entry interface
export interface LogEntry {
  timestamp?: string;
  level: string;
  traceId: string;
  module: string;
  action?: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// 🎯 Logger Stream interface for Morgan integration
export interface LoggerStream {
  write: (message: string) => void;
}
