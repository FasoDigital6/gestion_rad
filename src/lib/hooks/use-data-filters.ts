import { useState, useMemo } from "react";

export interface FilterValue {
  client?: string | null;
  status?: string | null;
  period?: {
    type: "week" | "month" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
  } | null;
  search?: string;
}

export interface UseDataFiltersResult {
  filters: FilterValue;
  setFilter: (key: keyof FilterValue, value: any) => void;
  clearFilter: (key: keyof FilterValue) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

export function useDataFilters(initialFilters: FilterValue = {}): UseDataFiltersResult {
  const [filters, setFilters] = useState<FilterValue>(initialFilters);

  const setFilter = (key: keyof FilterValue, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: keyof FilterValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key as keyof FilterValue];
      return value !== null && value !== undefined && value !== "";
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}
