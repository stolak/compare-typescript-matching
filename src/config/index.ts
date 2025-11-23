export const config = {
  port: process.env.PORT || 3005,
  serverUrl:
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3005}`,
  nodeEnv: process.env.NODE_ENV || "development",
  api: {
    prefix: "/api",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
} as const;
