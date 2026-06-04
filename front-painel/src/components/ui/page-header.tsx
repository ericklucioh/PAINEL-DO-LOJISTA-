"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    tone?: "slate" | "cyan" | "zinc" | "blue";
    className?: string;
};

const toneClasses: Record<
    NonNullable<PageHeaderProps["tone"]>,
    {
        root: string;
        eyebrow: string;
        description: string;
    }
> = {
    slate: {
        root: "bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))]",
        eyebrow: "text-slate-400",
        description: "text-slate-300",
    },
    cyan: {
        root: "bg-[linear-gradient(135deg,rgba(7,89,133,0.98),rgba(14,116,144,0.92))]",
        eyebrow: "text-cyan-100/80",
        description: "text-cyan-50/80",
    },
    zinc: {
        root: "bg-[linear-gradient(135deg,rgba(24,24,27,0.98),rgba(63,63,70,0.92))]",
        eyebrow: "text-slate-400",
        description: "text-slate-300",
    },
    blue: {
        root: "bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,99,235,0.92))]",
        eyebrow: "text-blue-100/75",
        description: "text-blue-50/80",
    },
};

export function PageHeader({
    eyebrow,
    title,
    description,
    action,
    tone = "slate",
    className,
}: PageHeaderProps) {
    const classes = toneClasses[tone];

    return (
        <div
            className={cn(
                "rounded-[2rem] border border-slate-200 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]",
                classes.root,
                className,
            )}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                    {eyebrow ? (
                        <p
                            className={cn(
                                "text-xs font-semibold uppercase tracking-[0.24em]",
                                classes.eyebrow,
                            )}
                        >
                            {eyebrow}
                        </p>
                    ) : null}
                    <h2 className="text-3xl font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description ? (
                        <p
                            className={cn(
                                "max-w-2xl text-sm leading-6",
                                classes.description,
                            )}
                        >
                            {description}
                        </p>
                    ) : null}
                </div>

                {action ? <div>{action}</div> : null}
            </div>
        </div>
    );
}
