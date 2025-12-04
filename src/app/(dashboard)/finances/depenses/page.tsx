"use client";

import { useMemo, useState } from "react";
import { useDepenses, useDeleteDepense } from "@/lib/hooks/use-depense";
import { useAuth } from "@/lib/firebase/auth/auth-context";
import { DataTable } from "@/components/data-table/data-table";
import { createDepenseColumns } from "@/components/depense/depense-columns";
import { DepenseFormSheet } from "@/components/depense/depense-form-sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2 } from "lucide-react";
import type { Depense } from "@/lib/types/depense";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DepensesPage() {
  const { data: depenses, isLoading } = useDepenses();
  const deleteMutation = useDeleteDepense();
  const auth = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState<Depense | null>(null);
  const [depenseToDelete, setDepenseToDelete] = useState<Depense | null>(null);

  const handleEdit = (depense: Depense) => {
    setSelectedDepense(depense);
    setIsFormOpen(true);
  };

  const handleDelete = (depense: Depense) => {
    setDepenseToDelete(depense);
  };

  const confirmDelete = async () => {
    if (!depenseToDelete) return;

    try {
      await deleteMutation.mutateAsync(depenseToDelete.id);
      toast.success("Dépense supprimée avec succès");
      setDepenseToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
    }
  };

  const handleAddNew = () => {
    setSelectedDepense(null);
    setIsFormOpen(true);
  };

  const columns = useMemo(
    () => createDepenseColumns(handleEdit, handleDelete),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/finances">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Dépenses</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Gérez toutes vos dépenses
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-brand hover:bg-brand/90">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une dépense
        </Button>
      </div>

      {/* Table des dépenses */}
      <DataTable
        columns={columns}
        data={depenses || []}
        filterColumn="description"
        filterPlaceholder="Rechercher une dépense..."
      />

      {/* Formulaire d'ajout/édition */}
      <DepenseFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        depense={selectedDepense}
        userId={auth?.uid}
        userName={auth?.displayName || undefined}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={!!depenseToDelete}
        onOpenChange={(open) => !open && setDepenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action
              est irréversible.
              {depenseToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>{depenseToDelete.description}</strong>
                  <br />
                  Montant: {depenseToDelete.montant.toLocaleString()} GNF
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
