import { Prisma, PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
import type {
    CloseCashRegisterResponse,
    OpenCashRegisterBody,
    OpenCashRegisterResponse,
} from "./cash-registers.schema";

type CashRegisterRecord = {
    id: string;
    openedByUserId: string;
    activeOpenedByUserId: string | null;
    initialBalance: number | { toNumber(): number };
    status: "ABERTO" | "FECHADO";
    openedAt: Date;
    closedAt: Date | null;
    note: string | null;
};

export interface OpenCashRegisterInput extends OpenCashRegisterBody {
    openedByUserId: string;
    openedByUserName: string;
}

export interface CloseCashRegisterInput {
    openedByUserId: string;
    openedByUserName: string;
}

export interface CashRegistersService {
    open(input: OpenCashRegisterInput): Promise<OpenCashRegisterResponse>;
    close(input: CloseCashRegisterInput): Promise<CloseCashRegisterResponse>;
}

export interface CreateCashRegistersServiceDependencies {
    prisma: Pick<PrismaClient, "cashRegister">;
}

function toNumber(value: CashRegisterRecord["initialBalance"]): number {
    return typeof value === "number" ? value : value.toNumber();
}

function toResponse(
    cashRegister: CashRegisterRecord,
    openedByUserName: string,
): OpenCashRegisterResponse["cashRegister"] {
    const initialBalance = toNumber(cashRegister.initialBalance);

    return {
        id: cashRegister.id,
        openedByUserId: cashRegister.openedByUserId,
        openedByUserName,
        initialBalance,
        currentBalance: initialBalance,
        status: cashRegister.status === "ABERTO" ? "OPEN" : "CLOSED",
        openedAt: cashRegister.openedAt.toISOString(),
        closedAt: cashRegister.closedAt?.toISOString() ?? null,
        note: cashRegister.note,
    };
}

function getOpenCashRegisterOrFail(
    prisma: Pick<PrismaClient, "cashRegister">,
    openedByUserId: string,
): Promise<CashRegisterRecord> {
    return prisma.cashRegister.findFirstOrThrow({
        where: {
            openedByUserId,
            status: "ABERTO",
            deletedAt: null,
        },
    }) as Promise<CashRegisterRecord>;
}

export function createCashRegistersService({
    prisma,
}: CreateCashRegistersServiceDependencies): CashRegistersService {
    return {
        async open(input) {
            const existingOpenCashRegister =
                await prisma.cashRegister.findFirst({
                    where: {
                        openedByUserId: input.openedByUserId,
                        status: "ABERTO",
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                    },
                });

            if (existingOpenCashRegister !== null) {
                throw createHttpError(
                    "Já existe um caixa aberto para este usuário",
                    400,
                );
            }

            const now = new Date();
            let createdCashRegister: CashRegisterRecord;

            try {
                createdCashRegister = (await prisma.cashRegister.create({
                    data: {
                        openedByUserId: input.openedByUserId,
                        activeOpenedByUserId: input.openedByUserId,
                        initialBalance: input.initialBalance,
                        status: "ABERTO",
                        openedAt: now,
                        closedAt: null,
                        note: input.note ?? null,
                        deletedAt: null,
                    },
                })) as CashRegisterRecord;
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    throw createHttpError(
                        "Já existe um caixa aberto para este usuário",
                        400,
                    );
                }

                throw error;
            }

            return {
                cashRegister: toResponse(
                    createdCashRegister,
                    input.openedByUserName,
                ),
            };
        },

        async close(input) {
            let openCashRegister: CashRegisterRecord;

            try {
                openCashRegister = await getOpenCashRegisterOrFail(
                    prisma,
                    input.openedByUserId,
                );
            } catch {
                throw createHttpError(
                    "Não existe um caixa aberto para este usuário",
                    400,
                );
            }

            const closedCashRegister = (await prisma.cashRegister.update({
                where: {
                    id: openCashRegister.id,
                },
                data: {
                    status: "FECHADO",
                    closedAt: new Date(),
                    activeOpenedByUserId: null,
                },
            })) as CashRegisterRecord;

            return {
                cashRegister: toResponse(
                    closedCashRegister,
                    input.openedByUserName,
                ),
            };
        },
    };
}
