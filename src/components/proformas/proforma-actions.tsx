"use client";

import { useState } from "react";
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
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
import { Proforma } from "@/lib/types/proforma";
import { useUpdateProformaStatut } from "@/lib/hooks/use-proformas";

interface ProformaActionsProps {
  proforma: Proforma;
  variant?: "buttons";
}

export function ProformaActions({
  proforma,
  variant = "buttons",
}: ProformaActionsProps) {
  const [isEnvoyeDialogOpen, setIsEnvoyeDialogOpen] = useState(false);
  const [isValideDialogOpen, setIsValideDialogOpen] = useState(false);
  const [isRejeteDialogOpen, setIsRejeteDialogOpen] = useState(false);

  const updateStatutMutation = useUpdateProformaStatut();

  const handleEnvoyer = async () => {
    try {
      await updateStatutMutation.mutateAsync({
        id: proforma.id,
        statut: "ENVOYE",
        dateEnvoi: new Date(),
      });
      setIsEnvoyeDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const handleValider = async () => {
    try {
      await updateStatutMutation.mutateAsync({
        id: proforma.id,
        statut: "VALIDE",
        dateValidation: new Date(),
      });
      setIsValideDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const handleRejeter = async () => {
    try {
      await updateStatutMutation.mutateAsync({
        id: proforma.id,
        statut: "REJETE",
      });
      setIsRejeteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  // Déterminer quels boutons afficher selon le statut actuel
  const showEnvoyerButton = proforma.statut === "BROUILLON";
  const showValiderButton = proforma.statut === "ENVOYE";
  const showRejeterButton = proforma.statut === "ENVOYE";

  // Si aucun bouton à afficher, ne rien retourner
  if (!showEnvoyerButton && !showValiderButton && !showRejeterButton) {
    return null;
  }

  return (
    <>
      {/* Boutons de changement de statut */}
      <div className="flex items-center gap-2">
        {showEnvoyerButton && (
          <Button
            onClick={() => setIsEnvoyeDialogOpen(true)}
            disabled={updateStatutMutation.isPending}
            className="gap-2"
          >
            {updateStatutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Marquer comme envoyé
          </Button>
        )}

        {showValiderButton && (
          <Button
            onClick={() => setIsValideDialogOpen(true)}
            disabled={updateStatutMutation.isPending}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {updateStatutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Valider
          </Button>
        )}

        {showRejeterButton && (
          <Button
            onClick={() => setIsRejeteDialogOpen(true)}
            disabled={updateStatutMutation.isPending}
            variant="destructive"
            className="gap-2"
          >
            {updateStatutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Rejeter
          </Button>
        )}
      </div>

      {/* Dialog Envoyer */}
      <AlertDialog
        open={isEnvoyeDialogOpen}
        onOpenChange={setIsEnvoyeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer comme envoyé</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir marquer le proforma{" "}
              <strong>{proforma.numero}</strong> comme envoyé au client{" "}
              <strong>{proforma.clientNom}</strong> ?
              <br />
              <br />
              Cette action changera le statut du proforma et vous ne pourrez
              plus le modifier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatutMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnvoyer}
              disabled={updateStatutMutation.isPending}
            >
              {updateStatutMutation.isPending
                ? "Changement en cours..."
                : "Marquer comme envoyé"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Valider */}
      <AlertDialog
        open={isValideDialogOpen}
        onOpenChange={setIsValideDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider le proforma</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider le proforma{" "}
              <strong>{proforma.numero}</strong> ?
              <br />
              <br />
              Cette action indique que le client a accepté le proforma. Vous
              pourrez ensuite générer un bon de commande (BDC) à partir de ce
              proforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatutMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValider}
              disabled={updateStatutMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateStatutMutation.isPending
                ? "Validation en cours..."
                : "Valider"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Rejeter */}
      <AlertDialog
        open={isRejeteDialogOpen}
        onOpenChange={setIsRejeteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le proforma</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir rejeter le proforma{" "}
              <strong>{proforma.numero}</strong> ?
              <br />
              <br />
              Cette action indique que le client a refusé le proforma. Le
              proforma sera marqué comme rejeté et ne pourra plus être modifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatutMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejeter}
              disabled={updateStatutMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {updateStatutMutation.isPending
                ? "Rejet en cours..."
                : "Rejeter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
