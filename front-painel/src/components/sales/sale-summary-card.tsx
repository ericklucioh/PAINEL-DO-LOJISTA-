"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import type { CashRegister } from "@/types/api";
import {
    formatCurrency,
    type SaleSummary,
} from "@/components/sales/sales.helpers";

type SaleSummaryCardProps = {
    summary: SaleSummary;
    discountInput: string;
    cashRegister: CashRegister | null;
    onDiscountChange: (value: string) => void;
    onOpenSummary: () => void;
    onClearCart: () => void;
};

export function SaleSummaryCard({
    summary,
    discountInput,
    cashRegister,
    onDiscountChange,
    onOpenSummary,
    onClearCart,
}: SaleSummaryCardProps) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 space-y-1">
                <h3 className="text-lg font-semibold text-slate-950">Resumo</h3>
                <p className="text-sm text-slate-500">
                    Total bruto, desconto e valor final.
                </p>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-600">Itens</span>
                    <strong className="text-slate-950">
                        {summary.itemCount}
                    </strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-slate-600">Bruto</span>
                    <strong className="text-slate-950">
                        {formatCurrency(summary.subtotal)}
                    </strong>
                </div>
                <TextField
                    label="Desconto"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountInput}
                    onChange={(event) => onDiscountChange(event.target.value)}
                />
                <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                    <span className="text-sm font-medium text-slate-200">
                        Total
                    </span>
                    <strong className="text-xl">
                        {formatCurrency(summary.total)}
                    </strong>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
                <Button
                    type="button"
                    onClick={onOpenSummary}
                    disabled={cashRegister === null || summary.itemCount === 0}
                >
                    Finalizar venda
                </Button>
                <Button variant="outline" type="button" onClick={onClearCart}>
                    Limpar carrinho
                </Button>
            </div>
        </section>
    );
}
