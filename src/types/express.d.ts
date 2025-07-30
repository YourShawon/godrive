// 🎯 Express Request Extensions for TypeScript
// This file extends the Express Request interface to include our custom properties

declare global {
  namespace Express {
    interface Request {
      traceId: string;
    }
  }
}

export {};
