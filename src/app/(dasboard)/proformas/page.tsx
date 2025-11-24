"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProformas } from "@/lib/hooks/use-proformas";

export default function ProformasPage() {
  const { data: proformas, isLoading, error } = useProformas();

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proformas</h1>
          <p className="text-muted-foreground">
            Gestion des proformas et appels d'offres
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau proforma
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des proformas
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={proformas || []}
          filterColumn="numero"
          filterPlaceholder="Rechercher un proforma..."
        />
      )}
    </div>
  );
}
