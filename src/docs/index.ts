import { swaggerConfig } from "./swagger.config.js";
import { authPaths } from "@modules/auth/auth.swagger.js";

const allPaths = {
  ...authPaths,
};

// Complete Swagger configuration
export const completeSwaggerConfig = {
  ...swaggerConfig,
  paths: allPaths,
};

export default completeSwaggerConfig;
