"use client";

import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import {
    formatCurrency,
    type SaleSummary,
} from "@/components/sales/sales.helpers";

type SaleSummaryModalProps = {
    open: boolean;
    summary: SaleSummary;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
};

export function SaleSummaryModal({
    open,
    summary,
    onClose,
    onConfirm,
    isSubmitting,
}: SaleSummaryModalProps) {
    return (
        <ModalShell
            open={open}
            onClose={onClose}
            sectionLabel="Venda"
            title="Resumo da venda"
            maxWidth="md"
            footer={
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Voltar
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processando..." : "Confirmar venda"}
                    </Button>
                </div>
            }
        >
            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Itens</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">
                        {summary.itemCount}
                    </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">
                        Forma de pagamento
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">
                        Dinheiro
                    </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Valor bruto</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">
                        {formatCurrency(summary.subtotal)}
                    </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Desconto</div>
                    <div className="mt-1 text-xl font-semibold text-slate-950">
                        {formatCurrency(summary.discount)}
                    </div>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 text-white md:col-span-2">
                    <div className="text-sm text-slate-300">Total final</div>
                    <div className="mt-1 text-3xl font-semibold">
                        {formatCurrency(summary.total)}
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
