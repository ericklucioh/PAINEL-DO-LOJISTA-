"use client";

import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
};

type ControlFieldProps = {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
};

export function controlClassName(
    hasError: boolean,
    className?: string,
): string {
    return cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400",
        hasError ? "border-rose-300" : "border-slate-200",
        className,
    );
}

export function FormField({
    label,
    error,
    hint,
    required = false,
    children,
    className,
}: FormFieldProps) {
    return (
        <label className={cn("grid gap-2", className)}>
            <span className="text-sm font-medium text-slate-700">
                {label}
                {required ? <span className="text-rose-600"> *</span> : null}
            </span>
            {children}
            {hint ? (
                <span className="text-xs leading-5 text-slate-500">{hint}</span>
            ) : null}
            {error ? (
                <span className="text-sm text-rose-600">{error}</span>
            ) : null}
        </label>
    );
}

export function TextField({
    label,
    error,
    hint,
    required = false,
    className,
    ...props
}: ControlFieldProps & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <FormField label={label} error={error} hint={hint} required={required}>
            <input
                className={controlClassName(Boolean(error), className)}
                {...props}
            />
        </FormField>
    );
}

export function SelectField({
    label,
    error,
    hint,
    required = false,
    className,
    children,
    ...props
}: ControlFieldProps &
    SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
    return (
        <FormField label={label} error={error} hint={hint} required={required}>
            <select
                className={controlClassName(Boolean(error), className)}
                {...props}
            >
                {children}
            </select>
        </FormField>
    );
}

export function TextareaField({
    label,
    error,
    hint,
    required = false,
    className,
    rows = 4,
    ...props
}: ControlFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <FormField label={label} error={error} hint={hint} required={required}>
            <textarea
                className={controlClassName(Boolean(error), className)}
                rows={rows}
                {...props}
            />
        </FormField>
    );
}
