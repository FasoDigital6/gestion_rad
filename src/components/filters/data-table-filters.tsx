"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DataTableFiltersProps {
  children: ReactNode;
  onClearAll?: () => void;
  hasActiveFilters?: boolean;
  activeFiltersCount?: number;
}

export function DataTableFilters({
  children,
  onClearAll,
  hasActiveFilters = false,
  activeFiltersCount = 0,
}: DataTableFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        {hasActiveFilters && onClearAll && (
          <Button
            variant="ghost"
            onClick={onClearAll}
            className="h-10 px-3 text-sm"
          >
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
            {activeFiltersCount > 0 && (
              <span className="ml-1 text-muted-foreground">
                ({activeFiltersCount})
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
