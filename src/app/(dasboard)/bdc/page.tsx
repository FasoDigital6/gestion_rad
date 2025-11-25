"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBDCs } from "@/lib/hooks/use-bdc";
import { BDCFormSheet } from "@/components/bdc/bdc-form-sheet";
import { useAuth } from "@/lib/context/auth-context";

export default function BDCPage() {
  const { data: bdcs, isLoading, error } = useBDCs();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddBDC = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bons de Commande</h1>
          <p className="text-muted-foreground">
            Suivi des bons de commande clients
          </p>
        </div>
        <Button onClick={handleAddBDC}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau BDC
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des BDC
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={bdcs || []}
          filterColumn="numero"
          filterPlaceholder="Rechercher un BDC..."
        />
      )}

      <BDCFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userId={user?.uid || ""}
      />
    </div>
  );
}
