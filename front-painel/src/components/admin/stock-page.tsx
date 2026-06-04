"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
    SelectField,
    TextField,
    TextareaField,
} from "@/components/ui/form-field";
import { useToast } from "@/components/providers/toaster";
import { productsService } from "@/services/products.service";
import { stockService } from "@/services/stock.service";
import { formatDate } from "@/lib/formatters";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ProductListItem, StockMovement } from "@/types/api";
import {
    StockEntryFormSchema,
    StockExitFormSchema,
} from "@/schemas/stock.schema";
import type {
    StockEntryFormValues,
    StockExitFormValues,
} from "@/schemas/stock.schema";

function formatReason(reason: string): string {
    return reason
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function StockPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [history, setHistory] = useState<StockMovement[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const entryForm = useForm<StockEntryFormValues>({
        resolver: zodResolver(StockEntryFormSchema),
        defaultValues: {
            productId: "",
            type: "COMPRA",
            quantity: 1,
            note: "",
        },
    });

    const exitForm = useForm<StockExitFormValues>({
        resolver: zodResolver(StockExitFormSchema),
        defaultValues: {
            productId: "",
            type: "DANIFICADO",
            quantity: 1,
            note: "",
        },
    });

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            setLoadingProducts(true);

            try {
                const response = await productsService.list({
                    page: 1,
                    search:
                        productSearch.trim().length > 0
                            ? productSearch.trim()
                            : undefined,
                });

                if (!active) {
                    return;
                }

                setProducts(response.data);
                if (response.data.length > 0) {
                    const hasSelected = response.data.some(
                        (product) => product.id === selectedProductId,
                    );
                    const nextSelected = hasSelected
                        ? selectedProductId
                        : response.data[0].id;
                    setSelectedProductId(nextSelected);
                    entryForm.setValue("productId", nextSelected);
                    exitForm.setValue("productId", nextSelected);
                } else {
                    setSelectedProductId("");
                    entryForm.setValue("productId", "");
                    exitForm.setValue("productId", "");
                    setHistory([]);
                }
            } catch (error) {
                if (active) {
                    toast({
                        variant: "error",
                        title: "Falha ao carregar produtos",
                        description: getApiErrorMessage(
                            error,
                            "Não foi possível carregar os produtos.",
                        ),
                    });
                }
            } finally {
                if (active) {
                    setLoadingProducts(false);
                }
            }
        };

        void loadProducts();

        return () => {
            active = false;
        };
    }, [entryForm, exitForm, productSearch, selectedProductId, toast]);

    useEffect(() => {
        if (!selectedProductId) {
            return;
        }

        let active = true;

        const loadHistory = async () => {
            setLoadingHistory(true);

            try {
                const response = await stockService.history(selectedProductId);
                if (!active) {
                    return;
                }

                setHistory(response.data);
            } catch (error) {
                if (active) {
                    toast({
                        variant: "error",
                        title: "Falha ao carregar histórico",
                        description: getApiErrorMessage(
                            error,
                            "Não foi possível carregar o histórico.",
                        ),
                    });
                }
            } finally {
                if (active) {
                    setLoadingHistory(false);
                }
            }
        };

        void loadHistory();

        return () => {
            active = false;
        };
    }, [selectedProductId, toast]);

    const selectedProduct = useMemo(
        () =>
            products.find((product) => product.id === selectedProductId) ??
            null,
        [products, selectedProductId],
    );

    const submitEntry = async (values: StockEntryFormValues) => {
        try {
            await stockService.entry(values);
            toast({
                variant: "success",
                title: "Entrada registrada com sucesso",
            });
            const response = await stockService.history(values.productId);
            setHistory(response.data);
        } catch (submitError) {
            const message = getApiErrorMessage(
                submitError,
                "Não foi possível registrar a entrada.",
            );
            toast({
                variant: "error",
                title: "Falha ao registrar entrada",
                description: message,
            });
        }
    };

    const submitExit = async (values: StockExitFormValues) => {
        try {
            await stockService.exit(values);
            toast({
                variant: "success",
                title: "Saída registrada com sucesso",
            });
            const response = await stockService.history(values.productId);
            setHistory(response.data);
        } catch (submitError) {
            const message = getApiErrorMessage(
                submitError,
                "Não foi possível registrar a saída.",
            );
            toast({
                variant: "error",
                title: "Falha ao registrar saída",
                description: message,
            });
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                tone="zinc"
                eyebrow="Admin / Estoque"
                title="Movimentações de estoque"
                description="Registre entrada, saída e acompanhe o histórico com saldo acumulado do produto selecionado."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
                <div className="space-y-6">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-lg font-semibold text-slate-950">
                                Produto
                            </h3>
                            <p className="text-sm text-slate-500">
                                Selecione um item para abrir o histórico e usar
                                nos formulários.
                            </p>
                        </div>

                        <TextField
                            label="Buscar produto"
                            placeholder="Nome ou EAN"
                            value={productSearch}
                            onChange={(event) => {
                                setProductSearch(event.target.value);
                            }}
                        />

                        <SelectField
                            className="mt-4"
                            label="Produto selecionado"
                            value={selectedProductId}
                            onChange={(event) => {
                                const nextProductId = event.target.value;
                                setSelectedProductId(nextProductId);
                                entryForm.setValue("productId", nextProductId);
                                exitForm.setValue("productId", nextProductId);
                                if (!nextProductId) {
                                    setHistory([]);
                                }
                            }}
                        >
                            <option value="">Selecione um produto</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.ean}
                                </option>
                            ))}
                        </SelectField>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            {loadingProducts ? (
                                "Carregando produtos..."
                            ) : selectedProduct ? (
                                <div className="space-y-1">
                                    <strong className="block text-slate-950">
                                        {selectedProduct.name}
                                    </strong>
                                    <span className="block">
                                        EAN: {selectedProduct.ean}
                                    </span>
                                    <span className="block">
                                        Estoque atual:{" "}
                                        {selectedProduct.stockCurrent}
                                    </span>
                                </div>
                            ) : (
                                "Nenhum produto selecionado."
                            )}
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <form
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                            onSubmit={entryForm.handleSubmit(submitEntry)}
                        >
                            <div className="mb-4 space-y-1">
                                <h3 className="text-lg font-semibold text-slate-950">
                                    Registrar entrada
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Compra, devolução ou outro ajuste positivo.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <SelectField
                                    label="Tipo"
                                    error={
                                        entryForm.formState.errors.type?.message
                                    }
                                    {...entryForm.register("type")}
                                >
                                    <option value="COMPRA">Compra</option>
                                    <option value="DEVOLUCAO">Devolução</option>
                                    <option value="OUTROS">Outros</option>
                                </SelectField>

                                <TextField
                                    label="Quantidade"
                                    type="number"
                                    min="1"
                                    step="1"
                                    error={
                                        entryForm.formState.errors.quantity
                                            ?.message
                                    }
                                    {...entryForm.register("quantity", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <TextareaField
                                    label="Observação"
                                    rows={4}
                                    error={
                                        entryForm.formState.errors.note?.message
                                    }
                                    {...entryForm.register("note")}
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        entryForm.formState.isSubmitting ||
                                        !selectedProductId
                                    }
                                >
                                    {entryForm.formState.isSubmitting
                                        ? "Registrando..."
                                        : "Registrar entrada"}
                                </Button>
                            </div>
                        </form>

                        <form
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                            onSubmit={exitForm.handleSubmit(submitExit)}
                        >
                            <div className="mb-4 space-y-1">
                                <h3 className="text-lg font-semibold text-slate-950">
                                    Registrar saída
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Danificado ou perda. O estoque pode ficar
                                    negativo.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <SelectField
                                    label="Tipo"
                                    error={
                                        exitForm.formState.errors.type?.message
                                    }
                                    {...exitForm.register("type")}
                                >
                                    <option value="DANIFICADO">
                                        Danificado
                                    </option>
                                    <option value="PERDA">Perda</option>
                                </SelectField>

                                <TextField
                                    label="Quantidade"
                                    type="number"
                                    min="1"
                                    step="1"
                                    error={
                                        exitForm.formState.errors.quantity
                                            ?.message
                                    }
                                    {...exitForm.register("quantity", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <TextareaField
                                    label="Observação"
                                    rows={4}
                                    error={
                                        exitForm.formState.errors.note?.message
                                    }
                                    {...exitForm.register("note")}
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        exitForm.formState.isSubmitting ||
                                        !selectedProductId
                                    }
                                >
                                    {exitForm.formState.isSubmitting
                                        ? "Registrando..."
                                        : "Registrar saída"}
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 space-y-1">
                        <h3 className="text-lg font-semibold text-slate-950">
                            Histórico
                        </h3>
                        <p className="text-sm text-slate-500">
                            {selectedProduct
                                ? `Movimentações de ${selectedProduct.name}.`
                                : "Selecione um produto para ver o histórico."}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        <th className="px-4 py-3">Data</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">
                                            Quantidade
                                        </th>
                                        <th className="px-4 py-3">Motivo</th>
                                        <th className="px-4 py-3">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingHistory ? (
                                        <tr>
                                            <td
                                                className="px-4 py-10 text-sm text-slate-500"
                                                colSpan={5}
                                            >
                                                Carregando histórico...
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td
                                                className="px-4 py-10 text-sm text-slate-500"
                                                colSpan={5}
                                            >
                                                Nenhuma movimentação registrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((movement) => (
                                            <tr key={movement.id}>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {formatDate(
                                                        movement.createdAt,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                    {movement.type === "ENTRY"
                                                        ? "Entrada"
                                                        : "Saída"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {movement.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {formatReason(
                                                        movement.reason,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {movement.balanceAfter}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
