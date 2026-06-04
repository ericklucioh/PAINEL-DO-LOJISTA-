import { z } from "zod";

export const OpenCashRegisterFormSchema = z.object({
    initialBalance: z.number().positive("Informe um saldo inicial válido"),
    note: z.string().trim().max(180, "Observação muito longa").optional(),
});

export const CashRegisterStorageSchema = z
    .object({
        id: z.string().min(1),
        openedByUserId: z.string().min(1),
        openedByUserName: z.string().min(1),
        initialBalance: z.number().finite(),
        currentBalance: z.number().finite(),
        status: z.enum(["OPEN", "CLOSED"]),
        openedAt: z.string().min(1),
        closedAt: z.string().nullable(),
        note: z.string().nullable(),
    })
    .strict();

export type OpenCashRegisterFormValues = z.infer<
    typeof OpenCashRegisterFormSchema
>;

export type CashRegisterStorageValues = z.infer<
    typeof CashRegisterStorageSchema
>;
