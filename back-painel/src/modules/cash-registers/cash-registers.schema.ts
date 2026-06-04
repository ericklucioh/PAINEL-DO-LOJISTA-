import { z } from "zod";

export const OpenCashRegisterBodySchema = z.object({
    initialBalance: z.number().positive(),
    note: z.string().trim().max(180).optional(),
});

export const CashRegisterSchema = z.object({
    id: z.string(),
    openedByUserId: z.string(),
    openedByUserName: z.string(),
    initialBalance: z.number(),
    currentBalance: z.number(),
    status: z.enum(["OPEN", "CLOSED"]),
    openedAt: z.string(),
    closedAt: z.string().nullable(),
    note: z.string().nullable(),
});

export const OpenCashRegisterResponseSchema = z.object({
    cashRegister: CashRegisterSchema,
});

export const CloseCashRegisterResponseSchema = OpenCashRegisterResponseSchema;

export type OpenCashRegisterBody = z.infer<typeof OpenCashRegisterBodySchema>;
export type CashRegisterDto = z.infer<typeof CashRegisterSchema>;
export type OpenCashRegisterResponse = z.infer<
    typeof OpenCashRegisterResponseSchema
>;
export type CloseCashRegisterResponse = z.infer<
    typeof CloseCashRegisterResponseSchema
>;
