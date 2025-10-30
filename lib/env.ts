/**
 * Environment Variables Configuration
 * Centralized access to environment variables with type safety and validation
 */

export const env = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  llmApiUrl: process.env.NEXT_PUBLIC_LLM_API_URL || "http://localhost:8001",

  // Authentication
  jwtSecret: process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret-key",

  // API Keys (server-side only)
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",

  // Environment
  env: process.env.NEXT_PUBLIC_ENV || "development",
  isDevelopment: process.env.NEXT_PUBLIC_ENV === "development",
  isProduction: process.env.NEXT_PUBLIC_ENV === "production",

  // Feature Flags
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",

  // Desktop Backend
  desktopBackendPort: parseInt(process.env.NEXT_PUBLIC_DESKTOP_BACKEND_PORT || "5000"),

  // Database
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",

  // Analytics & Monitoring
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
} as const

/**
 * Validate required environment variables
 * Call this function at app startup to ensure all critical env vars are set
 */
export function validateEnv() {
  const errors: string[] = []

  // Only validate in production
  if (env.isProduction) {
    if (!env.apiUrl) errors.push("NEXT_PUBLIC_API_URL is required in production")
    if (!env.jwtSecret || env.jwtSecret === "dev-secret-key") {
      errors.push("NEXT_PUBLIC_JWT_SECRET must be set to a secure value in production")
    }
  }

  if (errors.length > 0) {
    console.error("❌ Environment validation failed:")
    errors.forEach((error) => console.error(`  - ${error}`))
    throw new Error("Invalid environment configuration")
  }

  console.log("✅ Environment variables validated successfully")
}

/**
 * Get full API URL with path
 */
export function getApiUrl(path: string): string {
  const base = env.apiUrl.endsWith("/") ? env.apiUrl.slice(0, -1) : env.apiUrl
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Get full LLM API URL with path
 */
export function getLlmApiUrl(path: string): string {
  const base = env.llmApiUrl.endsWith("/") ? env.llmApiUrl.slice(0, -1) : env.llmApiUrl
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${cleanPath}`
}
