import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MEDIASOUP_LISTEN_IP: z.string().default('0.0.0.0'),
  MEDIASOUP_ANNOUNCED_IP: z.string().default('127.0.0.1'),
  MEDIASOUP_MIN_PORT: z.string().default('2000').transform(Number),
  MEDIASOUP_MAX_PORT: z.string().default('2020').transform(Number),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Default environment variables are invalid or missing:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
