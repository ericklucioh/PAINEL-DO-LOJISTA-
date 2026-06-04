import { z } from "zod";

const EnvSchema = z.object({
    JWT_SECRET: z.string().min(1).default("dev-access-secret"),
    REFRESH_TOKEN_SECRET: z.string().min(1).default("dev-refresh-secret"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default("7d"),
    ACCESS_TOKEN_COOKIE_NAME: z.string().min(1).default("accessToken"),
    AUTH_COOKIE_NAME: z.string().min(1).default("refreshToken"),
    RECEIPT_PRINTER_MODE: z.enum(["stdout", "tcp"]).default("stdout"),
    RECEIPT_PRINTER_HOST: z.string().min(1).optional(),
    RECEIPT_PRINTER_PORT: z.coerce.number().int().positive().default(9100),
    RECEIPT_PRINTER_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(5000),
    NODE_ENV: z.string().optional(),
});

const parsedEnv = EnvSchema.parse(process.env);

export const env = {
    jwtSecret: parsedEnv.JWT_SECRET,
    refreshTokenSecret: parsedEnv.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: parsedEnv.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: parsedEnv.REFRESH_TOKEN_EXPIRES_IN,
    accessTokenCookieName: parsedEnv.ACCESS_TOKEN_COOKIE_NAME,
    authCookieName: parsedEnv.AUTH_COOKIE_NAME,
    receiptPrinterMode: parsedEnv.RECEIPT_PRINTER_MODE,
    receiptPrinterHost: parsedEnv.RECEIPT_PRINTER_HOST ?? null,
    receiptPrinterPort: parsedEnv.RECEIPT_PRINTER_PORT,
    receiptPrinterTimeoutMs: parsedEnv.RECEIPT_PRINTER_TIMEOUT_MS,
    nodeEnv: parsedEnv.NODE_ENV ?? "development",
} as const;
