import { api } from "@/lib/api";
import type {
    CashRegister,
    OpenCashRegisterInput,
    OpenCashRegisterResponse,
} from "@/types/api";

export const cashRegistersService = {
    open: async (payload: OpenCashRegisterInput) => {
        const response = await api.post<OpenCashRegisterResponse>(
            "/cash-registers/open",
            payload,
        );
        return response.data;
    },
    close: async () => {
        const response = await api.post<{ cashRegister: CashRegister }>(
            "/cash-registers/close",
            {},
        );
        return response.data;
    },
};
