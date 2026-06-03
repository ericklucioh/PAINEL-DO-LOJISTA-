import { z } from "zod";

const optionalNoteSchema = z.preprocess((value) => {
    if (typeof value === "string" && value.trim().length === 0) {
        return undefined;
    }

    return value;
}, z.string().trim().min(1).optional());

export const StockEntryBodySchema = z.object({
    productId: z.string().trim().min(1),
    type: z.enum(["COMPRA", "DEVOLUCAO", "OUTROS"]),
    quantity: z.coerce.number().int().positive(),
    note: optionalNoteSchema,
});

export const StockExitBodySchema = z.object({
    productId: z.string().trim().min(1),
    type: z.enum(["DANIFICADO", "PERDA"]),
    quantity: z.coerce.number().int().positive(),
    note: optionalNoteSchema,
});

export const StockHistoryQuerySchema = z.object({
    produto_id: z.string().trim().min(1),
});

export const StockMovementSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string(),
    type: z.enum(["ENTRY", "EXIT"]),
    reason: z.string(),
    quantity: z.number().int().positive(),
    balanceBefore: z.number().int(),
    balanceAfter: z.number().int(),
    note: z.string().nullable(),
    createdAt: z.string(),
});

export const StockMovementResponseSchema = z.object({
    stockCurrent: z.number().int(),
    movement: StockMovementSchema,
});

export const StockHistoryResponseSchema = z.object({
    product: z.object({
        id: z.string(),
        ean: z.string(),
        name: z.string(),
    }),
    data: z.array(StockMovementSchema),
});

export type StockEntryBody = z.infer<typeof StockEntryBodySchema>;
export type StockExitBody = z.infer<typeof StockExitBodySchema>;
export type StockHistoryQuery = z.infer<typeof StockHistoryQuerySchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type StockMovementResponse = z.infer<typeof StockMovementResponseSchema>;
export type StockHistoryResponse = z.infer<typeof StockHistoryResponseSchema>;
