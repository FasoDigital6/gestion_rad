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
import { useUpdateBdcStatut } from "@/lib/hooks/use-bdc";
import { Bdc, BdcStatut } from "@/lib/types/bdc";
import { getNextBdcStatuses, getBdcStatusLabel } from "@/lib/utils/bdc";
import { Loader2, Send, CheckCircle, Ban } from "lucide-react";

interface BdcActionsProps {
  bdc: Bdc;
}

export function BdcActions({ bdc }: BdcActionsProps) {
  const [selectedStatus, setSelectedStatus] = useState<BdcStatut | null>(null);
  const updateStatutMutation = useUpdateBdcStatut();

  const nextStatuses = getNextBdcStatuses(bdc.statut);

  if (nextStatuses.length === 0) {
    return null;
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    const now = new Date();

    const payload: {
      id: string;
      statut: BdcStatut;
      dateEnvoi?: Date;
      dateApprobation?: Date;
      dateAnnulation?: Date;
    } = {
      id: bdc.id,
      statut: selectedStatus,
    };

    if (selectedStatus === "ENVOYE") {
      payload.dateEnvoi = now;
    } else if (selectedStatus === "APPROUVE") {
      payload.dateApprobation = now;
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

  const getStatusIcon = (status: BdcStatut) => {
    switch (status) {
      case "ENVOYE":
        return <Send className="mr-2 h-4 w-4" />;
      case "APPROUVE":
        return <CheckCircle className="mr-2 h-4 w-4" />;
      case "ANNULE":
        return <Ban className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (
    status: BdcStatut
  ): "default" | "destructive" | "outline" => {
    if (status === "ANNULE") return "destructive";
    if (status === "APPROUVE") return "default";
    return "outline";
  };

  const getConfirmationMessage = (status: BdcStatut) => {
    switch (status) {
      case "ENVOYE":
        return "Le BDC sera marqué comme envoyé au client. Vous ne pourrez plus le modifier.";
      case "APPROUVE":
        return "Le BDC sera marqué comme approuvé. Vous pourrez ensuite créer des bons de livraison.";
      case "ANNULE":
        return "Ce bon de commande sera annulé. Cette action est définitive.";
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
                Marquer comme {getBdcStatusLabel(status).toLowerCase()}
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
