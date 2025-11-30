"use client";

import { useState } from "react";
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
import { useUpdateBdlStatut } from "@/lib/hooks/use-bdl";
import { Bdl, BdlStatut } from "@/lib/types/bdl";
import { getNextBdlStatuses, getBdlStatusLabel } from "@/lib/utils/bdl";
import { Loader2, Truck, Package, Ban } from "lucide-react";

interface BdlActionsProps {
  bdl: Bdl;
}

export function BdlActions({ bdl }: BdlActionsProps) {
  const [selectedStatus, setSelectedStatus] = useState<BdlStatut | null>(null);
  const updateStatutMutation = useUpdateBdlStatut();

  const nextStatuses = getNextBdlStatuses(bdl.statut);

  if (nextStatuses.length === 0) {
    return null;
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    const now = new Date();

    const payload: {
      id: string;
      statut: BdlStatut;
      dateEnRoute?: Date;
      dateLivree?: Date;
      dateAnnulation?: Date;
    } = {
      id: bdl.id,
      statut: selectedStatus,
    };

    if (selectedStatus === "EN_ROUTE") {
      payload.dateEnRoute = now;
    } else if (selectedStatus === "LIVRE") {
      payload.dateLivree = now;
    } else if (selectedStatus === "ANNULE") {
      payload.dateAnnulation = now;
    }

    try {
      await updateStatutMutation.mutateAsync(payload);
      setSelectedStatus(null);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const getStatusIcon = (status: BdlStatut) => {
    switch (status) {
      case "EN_ROUTE":
        return <Truck className="mr-2 h-4 w-4" />;
      case "LIVRE":
        return <Package className="mr-2 h-4 w-4" />;
      case "ANNULE":
        return <Ban className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (
    status: BdlStatut
  ): "default" | "destructive" | "outline" => {
    if (status === "ANNULE") return "destructive";
    if (status === "LIVRE") return "default";
    return "outline";
  };

  const getConfirmationMessage = (status: BdlStatut) => {
    switch (status) {
      case "EN_ROUTE":
        return "La livraison sera marquée comme étant en route. Vous ne pourrez plus modifier ce bon de livraison.";
      case "LIVRE":
        return "La livraison sera marquée comme livrée. Cette action est définitive.";
      case "ANNULE":
        return "Ce bon de livraison sera annulé. Les quantités seront à nouveau disponibles pour une nouvelle livraison.";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant={getStatusVariant(status)}
            onClick={() => setSelectedStatus(status)}
            disabled={updateStatutMutation.isPending}
          >
            {updateStatutMutation.isPending &&
            selectedStatus === status ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                {getStatusIcon(status)}
                Marquer comme {getBdlStatusLabel(status).toLowerCase()}
              </>
            )}
          </Button>
        ))}
      </div>

      <AlertDialog
        open={selectedStatus !== null}
        onOpenChange={(open) => !open && setSelectedStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmer le changement de statut
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus && getConfirmationMessage(selectedStatus)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
