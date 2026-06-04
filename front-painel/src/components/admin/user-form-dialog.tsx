"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { SelectField, TextField } from "@/components/ui/form-field";
import { UserCreateSchema, UserUpdateSchema } from "@/schemas/user.schema";
import type {
    UserCreateFormValues,
    UserUpdateFormValues,
} from "@/schemas/user.schema";
import type { UserListItem, UserRole } from "@/types/api";

type UserFormDialogProps = {
    open: boolean;
    user: UserListItem | null;
    onClose: () => void;
    onSubmitCreate: (values: UserCreateFormValues) => Promise<void>;
    onSubmitUpdate: (id: string, values: UserUpdateFormValues) => Promise<void>;
};

function roleLabel(role: UserRole): string {
    return role === "ADMIN" ? "Admin" : "Vendedor";
}

export function UserFormDialog({
    open,
    user,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
}: UserFormDialogProps) {
    const isEditing = user !== null;
    const createFormId = "user-create-form";
    const updateFormId = "user-update-form";

    const createForm = useForm<UserCreateFormValues>({
        resolver: zodResolver(UserCreateSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: "VENDEDOR",
        },
    });

    const updateForm = useForm<UserUpdateFormValues>({
        resolver: zodResolver(UserUpdateSchema),
        defaultValues: {
            fullName: "",
            role: "VENDEDOR",
        },
    });

    useEffect(() => {
        if (!open) {
            createForm.reset();
            updateForm.reset();
            return;
        }

        if (user) {
            updateForm.reset({
                fullName: user.fullName,
                role: user.role,
            });
            return;
        }

        createForm.reset({
            fullName: "",
            email: "",
            password: "",
            role: "VENDEDOR",
        });
    }, [createForm, open, updateForm, user]);

    const title = isEditing ? "Editar usuário" : "Novo usuário";
    const description = isEditing
        ? "Atualize nome e perfil de acesso."
        : "Crie um novo usuário com e-mail e senha.";

    if (isEditing && user) {
        return (
            <ModalShell
                open={open}
                onClose={onClose}
                sectionLabel="Usuários"
                title={title}
                description={description}
                maxWidth="md"
                footer={
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form={updateFormId}
                            disabled={updateForm.formState.isSubmitting}
                        >
                            {updateForm.formState.isSubmitting
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </Button>
                    </div>
                }
            >
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Editando{" "}
                    <strong className="text-slate-950">{user.fullName}</strong>{" "}
                    como {roleLabel(user.role)}.
                </div>

                <form
                    id={updateFormId}
                    className="grid gap-4"
                    onSubmit={updateForm.handleSubmit(async (values) => {
                        await onSubmitUpdate(user.id, values);
                    })}
                >
                    <TextField
                        label="Nome completo"
                        autoComplete="name"
                        error={updateForm.formState.errors.fullName?.message}
                        {...updateForm.register("fullName")}
                    />

                    <SelectField
                        label="Tipo"
                        error={updateForm.formState.errors.role?.message}
                        {...updateForm.register("role")}
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="VENDEDOR">Vendedor</option>
                    </SelectField>
                </form>
            </ModalShell>
        );
    }

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            sectionLabel="Usuários"
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
                        form={createFormId}
                        disabled={createForm.formState.isSubmitting}
                    >
                        {createForm.formState.isSubmitting
                            ? "Criando..."
                            : "Criar usuário"}
                    </Button>
                </div>
            }
        >
            <form
                id={createFormId}
                className="grid gap-4"
                onSubmit={createForm.handleSubmit(async (values) => {
                    await onSubmitCreate(values);
                })}
            >
                <TextField
                    label="Nome completo"
                    autoComplete="name"
                    error={createForm.formState.errors.fullName?.message}
                    {...createForm.register("fullName")}
                />

                <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    error={createForm.formState.errors.email?.message}
                    {...createForm.register("email")}
                />

                <TextField
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    error={createForm.formState.errors.password?.message}
                    {...createForm.register("password")}
                />

                <SelectField
                    label="Tipo"
                    error={createForm.formState.errors.role?.message}
                    {...createForm.register("role")}
                >
                    <option value="ADMIN">Admin</option>
                    <option value="VENDEDOR">Vendedor</option>
                </SelectField>
            </form>
        </ModalShell>
    );
}
