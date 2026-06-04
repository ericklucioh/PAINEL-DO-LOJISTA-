import type { CreateSaleInput } from "@/types/api";
import type { CartItem } from "@/stores/cart.store";

export { formatCurrency, formatDate } from "@/lib/formatters";
export { getApiErrorMessage } from "@/lib/api-error";

export type SaleSummary = {
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
};

function clampDiscount(value: number, subtotal: number): number {
    if (!Number.isFinite(value) || value <= 0) {
        return 0;
    }

    return Math.min(value, subtotal);
}

export function calculateSaleSummary(
    items: CartItem[],
    discountInput: string,
): SaleSummary {
    const subtotal = items.reduce(
        (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
        0,
    );
    const discount = clampDiscount(Number(discountInput), subtotal);

    return {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        discount,
        total: Math.max(subtotal - discount, 0),
    };
}

export function toSaleItems(cartItems: CartItem[]): CreateSaleInput["items"] {
    return cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
    }));
}
