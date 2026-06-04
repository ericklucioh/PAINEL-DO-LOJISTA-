import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHttpError } from "../../utils/httpError";
import {
    CloseCashRegisterResponseSchema,
    OpenCashRegisterBodySchema,
    OpenCashRegisterResponseSchema,
} from "./cash-registers.schema";
import type { CashRegistersService } from "./cash-registers.service";

export interface CashRegistersController {
    open: RequestHandler;
    close: RequestHandler;
}

export interface CreateCashRegistersControllerDependencies {
    service: CashRegistersService;
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

export function createCashRegistersController({
    service,
}: CreateCashRegistersControllerDependencies): CashRegistersController {
    return {
        open: asyncHandler(async (req, res) => {
            const parsedBody = OpenCashRegisterBodySchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const authUser = req.authUser;
            if (authUser === undefined) {
                throw createHttpError("Token inválido", 401);
            }

            const response = await service.open({
                openedByUserId: authUser.sub,
                openedByUserName: authUser.nome,
                ...parsedBody.data,
            });

            const parsedResponse =
                OpenCashRegisterResponseSchema.parse(response);

            res.status(201).json(parsedResponse);
        }),

        close: asyncHandler(async (req, res) => {
            const authUser = req.authUser;
            if (authUser === undefined) {
                throw createHttpError("Token inválido", 401);
            }

            const response = await service.close({
                openedByUserId: authUser.sub,
                openedByUserName: authUser.nome,
            });

            const parsedResponse =
                CloseCashRegisterResponseSchema.parse(response);

            res.status(200).json(parsedResponse);
        }),
    };
}
