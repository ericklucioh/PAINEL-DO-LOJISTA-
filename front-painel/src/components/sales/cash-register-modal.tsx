"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { TextField, TextareaField } from "@/components/ui/form-field";
import {
    OpenCashRegisterFormSchema,
    type OpenCashRegisterFormValues,
} from "@/schemas/cash-register.schema";

type CashRegisterModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: OpenCashRegisterFormValues) => void | Promise<void>;
};

export function CashRegisterModal({
    open,
    onClose,
    onSubmit,
}: CashRegisterModalProps) {
    const formId = "cash-register-form";

    const form = useForm<OpenCashRegisterFormValues>({
        resolver: zodResolver(OpenCashRegisterFormSchema),
        defaultValues: {
            initialBalance: 150,
            note: "",
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset({
                initialBalance: 150,
                note: "",
            });
        }
    }, [form, open]);

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            sectionLabel="Caixa"
            title="Abrir caixa"
            description="Abra um caixa com saldo inicial para liberar a finalização da venda."
            maxWidth="sm"
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
                        {form.formState.isSubmitting
                            ? "Abrindo..."
                            : "Abrir caixa"}
                    </Button>
                </div>
            }
        >
            <form
                id={formId}
                className="grid gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <TextField
                    label="Saldo inicial"
                    type="number"
                    min="0.01"
                    step="0.01"
                    error={form.formState.errors.initialBalance?.message}
                    {...form.register("initialBalance", {
                        valueAsNumber: true,
                    })}
                />

                <TextareaField
                    label="Observação"
                    rows={4}
                    error={form.formState.errors.note?.message}
                    {...form.register("note")}
                />
            </form>
        </ModalShell>
    );
}
