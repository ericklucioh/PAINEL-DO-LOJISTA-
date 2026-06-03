import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHttpError } from "../../utils/httpError";
import {
    StockEntryBodySchema,
    StockExitBodySchema,
    StockHistoryQuerySchema,
    StockHistoryResponseSchema,
    StockMovementResponseSchema,
} from "./stock.schema";
import type { StockService } from "./stock.service";

export interface StockController {
    entry: RequestHandler;
    exit: RequestHandler;
    history: RequestHandler;
}

export interface CreateStockControllerDependencies {
    service: StockService;
}

function sendValidationError(
    res: Parameters<RequestHandler>[1],
    issues: unknown,
): void {
    res.status(400).json({
        message: "Validation error",
        issues,
    });
}

function requireAuthUser(req: Parameters<RequestHandler>[0]) {
    const authUser = req.authUser;

    if (authUser === undefined) {
        throw createHttpError("Token inválido", 401);
    }

    return authUser;
}

export function createStockController({
    service,
}: CreateStockControllerDependencies): StockController {
    return {
        entry: asyncHandler(async (req, res) => {
            const parsedBody = StockEntryBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const authUser = requireAuthUser(req);

            const response = await service.entry({
                ...parsedBody.data,
                createdByUserId: authUser.sub,
            });

            res.status(201).json(StockMovementResponseSchema.parse(response));
        }),

        exit: asyncHandler(async (req, res) => {
            const parsedBody = StockExitBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const authUser = requireAuthUser(req);

            const response = await service.exit({
                ...parsedBody.data,
                createdByUserId: authUser.sub,
            });

            res.status(201).json(StockMovementResponseSchema.parse(response));
        }),

        history: asyncHandler(async (req, res) => {
            const parsedQuery = StockHistoryQuerySchema.safeParse(req.query);
            if (!parsedQuery.success) {
                sendValidationError(res, parsedQuery.error.issues);
                return;
            }

            requireAuthUser(req);

            const response = await service.history(parsedQuery.data.produto_id);
            res.status(200).json(StockHistoryResponseSchema.parse(response));
        }),
    };
}
