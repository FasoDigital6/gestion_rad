"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBLs } from "@/lib/hooks/use-bl";
import { BLFormSheet } from "@/components/bl/bl-form-sheet";
import { useAuth } from "@/lib/context/auth-context";

export default function BLPage() {
  const { data: bls, isLoading, error } = useBLs();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddBL = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bons de Livraison
          </h1>
          <p className="text-muted-foreground">Gestion des livraisons</p>
        </div>
        <Button onClick={handleAddBL}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau BL
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des BL
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={bls || []}
          filterColumn="numero"
          filterPlaceholder="Rechercher un BL..."
        />
      )}

      <BLFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userId={user?.uid || ""}
      />
    </div>
  );
}
