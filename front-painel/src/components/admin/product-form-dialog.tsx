"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { TextField } from "@/components/ui/form-field";
import { ProductFormSchema } from "@/schemas/product.schema";
import type { ProductFormValues } from "@/schemas/product.schema";
import type { ProductListItem } from "@/types/api";

type ProductFormDialogProps = {
    open: boolean;
    product: ProductListItem | null;
    onClose: () => void;
    onSubmitCreate: (values: ProductFormValues) => Promise<void>;
    onSubmitUpdate: (id: string, values: ProductFormValues) => Promise<void>;
};

export function ProductFormDialog({
    open,
    product,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
}: ProductFormDialogProps) {
    const isEditing = product !== null;
    const formId = "product-form";

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(ProductFormSchema),
        defaultValues: {
            ean: "",
            name: "",
            price: 0,
            minStock: 0,
            maxStock: 0,
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
            return;
        }

        if (product) {
            form.reset({
                ean: product.ean,
                name: product.name,
                price: product.price,
                minStock: product.minStock,
                maxStock: product.maxStock,
            });
            return;
        }

        form.reset({
            ean: "",
            name: "",
            price: 0,
            minStock: 0,
            maxStock: 0,
        });
    }, [form, open, product]);

    const title = isEditing ? "Editar produto" : "Novo produto";
    const description = isEditing
        ? "Atualize os dados do catálogo."
        : "Cadastre um produto com EAN, preço e limites de estoque.";

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            sectionLabel="Produtos"
            title={title}
            description={description}
            maxWidth="md"
            footer={
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            }
        >
            {isEditing && product ? (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Editando{" "}
                    <strong className="text-slate-950">{product.name}</strong>.
                </div>
            ) : null}

            <form
                id={formId}
                className="grid gap-4"
                onSubmit={form.handleSubmit(async (values) => {
                    if (product) {
                        await onSubmitUpdate(product.id, values);
                        return;
                    }

                    await onSubmitCreate(values);
                })}
            >
                <TextField
                    label="EAN"
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="0000000000000"
                    error={form.formState.errors.ean?.message}
                    {...form.register("ean")}
                />

                <TextField
                    label="Nome do produto"
                    autoComplete="off"
                    error={form.formState.errors.name?.message}
                    {...form.register("name")}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <TextField
                        className="md:col-span-1"
                        label="Preço"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        error={form.formState.errors.price?.message}
                        {...form.register("price", {
                            valueAsNumber: true,
                        })}
                    />

                    <TextField
                        className="md:col-span-1"
                        label="Estoque mínimo"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        error={form.formState.errors.minStock?.message}
                        {...form.register("minStock", {
                            valueAsNumber: true,
                        })}
                    />

                    <TextField
                        className="md:col-span-1"
                        label="Estoque máximo"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="0"
                        error={form.formState.errors.maxStock?.message}
                        {...form.register("maxStock", {
                            valueAsNumber: true,
                        })}
                    />
                </div>
            </form>
        </ModalShell>
    );
}
