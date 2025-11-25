"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFactures } from "@/lib/hooks/use-factures";
import { FactureFormSheet } from "@/components/factures/facture-form-sheet";
import { useAuth } from "@/lib/context/auth-context";

export default function FacturesPage() {
  const { data: factures, isLoading, error } = useFactures();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddFacture = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Facturation et suivi des paiements
          </p>
        </div>
        <Button onClick={handleAddFacture}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des factures
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={factures || []}
          filterColumn="numero"
          filterPlaceholder="Rechercher une facture..."
        />
      )}

      <FactureFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userId={user?.uid || ""}
      />
    </div>
  );
}
