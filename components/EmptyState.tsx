
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          title,
                                                          description,
                                                          actionLabel,
                                                          onAction,
                                                          className,
                                                      }) => {
    return (
        <div
            className={cn(
                "flex flex-col  gap-1  items-center justify-center rounded-lg border py-10 border-dashed  text-center text-muted-foreground",
                className
            )}
        >
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm">{description}</p>
            )}

            {actionLabel && onAction && (
                <Button className="mt-4" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
