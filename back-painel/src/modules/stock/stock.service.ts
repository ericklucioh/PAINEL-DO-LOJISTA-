import type { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
import type {
    StockEntryBody,
    StockHistoryResponse,
    StockMovement,
    StockMovementResponse,
    StockExitBody,
} from "./stock.schema";

type ProductRecord = {
    id: string;
    ean: string;
    name: string;
    deletedAt: Date | null;
};

type InventoryMovementRecord = {
    id: string;
    productId: string;
    type:
        | "COMPRA"
        | "DEVOLUCAO"
        | "DANIFICADO"
        | "PERDA"
        | "VENDA"
        | "AJUSTE_ENTRADA"
        | "AJUSTE_SAIDA";
    quantity: number;
    note: string | null;
    createdAt: Date;
};

type StockMovementType = StockEntryBody["type"] | StockExitBody["type"];

export interface StockService {
    entry(input: StockEntryInput): Promise<StockMovementResponse>;
    exit(input: StockExitInput): Promise<StockMovementResponse>;
    history(productId: string): Promise<StockHistoryResponse>;
}

export interface StockEntryInput extends StockEntryBody {
    createdByUserId: string;
}

export interface StockExitInput extends StockExitBody {
    createdByUserId: string;
}

export interface CreateStockServiceDependencies {
    prisma: Pick<
        PrismaClient,
        "product" | "inventoryMovement" | "$transaction"
    >;
}

const ENTRY_TYPES = new Set([
    "COMPRA",
    "DEVOLUCAO",
    "OUTROS",
    "AJUSTE_ENTRADA",
]);

function normalizeNote(note: string | undefined): string | null {
    return note ?? null;
}

function movementTypeForResponse(
    type: InventoryMovementRecord["type"] | StockMovementType,
): "ENTRY" | "EXIT" {
    return ENTRY_TYPES.has(type) ? "ENTRY" : "EXIT";
}

function movementDelta(
    type: InventoryMovementRecord["type"] | StockMovementType,
    quantity: number,
): number {
    return ENTRY_TYPES.has(type) ? quantity : -quantity;
}

function movementReason(
    type: InventoryMovementRecord["type"] | StockMovementType,
    note: string | null,
): string {
    if (type === "COMPRA" || type === "PERDA") {
        return type;
    }

    return note ?? type;
}

function toMovementResponse(
    movement: InventoryMovementRecord,
    productName: string,
    balanceBefore: number,
    balanceAfter: number,
): StockMovement {
    return {
        id: movement.id,
        productId: movement.productId,
        productName,
        type: movementTypeForResponse(movement.type),
        reason: movementReason(movement.type, movement.note),
        quantity: movement.quantity,
        balanceBefore,
        balanceAfter,
        note: movement.note,
        createdAt: movement.createdAt.toISOString(),
    };
}

function buildHistoryData(
    movements: ReadonlyArray<InventoryMovementRecord>,
    productName: string,
): StockMovement[] {
    let balance = 0;

    return movements.map((movement) => {
        const balanceBefore = balance;
        balance += movementDelta(movement.type, movement.quantity);

        return toMovementResponse(
            movement,
            productName,
            balanceBefore,
            balance,
        );
    });
}

async function loadProductOrThrow(
    prisma: CreateStockServiceDependencies["prisma"],
    productId: string,
): Promise<ProductRecord> {
    const product = (await prisma.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
            ean: true,
            name: true,
            deletedAt: true,
        },
    })) as ProductRecord | null;

    if (product === null || product.deletedAt !== null) {
        throw createHttpError("Product not found", 404);
    }

    return product;
}

async function loadMovements(
    prisma: CreateStockServiceDependencies["prisma"],
    productId: string,
): Promise<InventoryMovementRecord[]> {
    return (await prisma.inventoryMovement.findMany({
        where: {
            productId,
        },
        orderBy: [
            {
                createdAt: "asc",
            },
            {
                id: "asc",
            },
        ],
        select: {
            id: true,
            productId: true,
            type: true,
            quantity: true,
            note: true,
            createdAt: true,
        },
    })) as InventoryMovementRecord[];
}

function calculateCurrentBalance(
    movements: ReadonlyArray<InventoryMovementRecord>,
): number {
    return movements.reduce(
        (total, movement) =>
            total + movementDelta(movement.type, movement.quantity),
        0,
    );
}

async function createMovement(
    prisma: CreateStockServiceDependencies["prisma"],
    input: StockEntryInput | StockExitInput,
    movementType: StockMovementType,
): Promise<StockMovementResponse> {
    return prisma.$transaction(async (tx) => {
        const product = await loadProductOrThrow(tx, input.productId);
        const currentMovements = await loadMovements(tx, product.id);
        const balanceBefore = calculateCurrentBalance(currentMovements);
        const delta = movementDelta(movementType, input.quantity);
        const balanceAfter = balanceBefore + delta;
        const persistedType: InventoryMovementRecord["type"] =
            movementType === "OUTROS" ? "AJUSTE_ENTRADA" : movementType;

        const createdMovement = (await tx.inventoryMovement.create({
            data: {
                productId: product.id,
                userId: input.createdByUserId,
                type: persistedType,
                quantity: input.quantity,
                note: normalizeNote(input.note),
            },
            select: {
                id: true,
                productId: true,
                type: true,
                quantity: true,
                note: true,
                createdAt: true,
            },
        })) as InventoryMovementRecord;

        return {
            stockCurrent: balanceAfter,
            movement: toMovementResponse(
                createdMovement,
                product.name,
                balanceBefore,
                balanceAfter,
            ),
        };
    });
}

export function createStockService({
    prisma,
}: CreateStockServiceDependencies): StockService {
    return {
        async entry(input) {
            return createMovement(prisma, input, input.type);
        },

        async exit(input) {
            return createMovement(prisma, input, input.type);
        },

        async history(productId) {
            const product = await loadProductOrThrow(prisma, productId);
            const movements = await loadMovements(prisma, product.id);

            return {
                product: {
                    id: product.id,
                    ean: product.ean,
                    name: product.name,
                },
                data: buildHistoryData(movements, product.name),
            };
        },
    };
}
