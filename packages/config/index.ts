import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  MQ_URL: z.string().optional(),
  LLM_PROVIDER: z.string().default("openai"),
  LLM_API_KEY: z.string().default(""),
  LLM_MODEL: z.string().default("qwen-plus"),
  LLM_BASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  return EnvSchema.parse(process.env);
}
