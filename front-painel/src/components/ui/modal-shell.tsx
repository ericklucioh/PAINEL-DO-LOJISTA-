"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalShellProps = {
    open: boolean;
    onClose: () => void;
    sectionLabel?: string;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
    hideCloseButton?: boolean;
    closeLabel?: string;
    overlayClassName?: string;
    panelClassName?: string;
};

const maxWidthClasses: Record<
    NonNullable<ModalShellProps["maxWidth"]>,
    string
> = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    "2xl": "max-w-6xl",
};

export function ModalShell({
    open,
    onClose,
    sectionLabel,
    title,
    description,
    children,
    footer,
    maxWidth = "md",
    hideCloseButton = false,
    closeLabel = "Fechar",
    overlayClassName,
    panelClassName,
}: ModalShellProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm",
                overlayClassName,
            )}
        >
            <div
                className={cn(
                    "w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]",
                    maxWidthClasses[maxWidth],
                    panelClassName,
                )}
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        {sectionLabel ? (
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {sectionLabel}
                            </p>
                        ) : null}
                        <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                            {title}
                        </h3>
                        {description ? (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    {hideCloseButton ? null : (
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={onClose}
                        >
                            {closeLabel}
                        </Button>
                    )}
                </div>

                <div>{children}</div>

                {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
        </div>
    );
}
