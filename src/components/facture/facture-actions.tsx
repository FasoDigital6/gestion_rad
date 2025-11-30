"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, XCircle, Loader2, FileText } from "lucide-react";
import { useUpdateFactureStatut } from "@/lib/hooks/use-facture";
import {
  canEmettreFacture,
  canAnnulerFacture,
} from "@/lib/utils/facture";
import type { Facture } from "@/lib/types/facture";

interface FactureActionsProps {
  facture: Facture;
}

export function FactureActions({ facture }: FactureActionsProps) {
  const router = useRouter();
  const [showEmettreDialog, setShowEmettreDialog] = useState(false);
  const [showAnnulerDialog, setShowAnnulerDialog] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState("");

  const updateStatut = useUpdateFactureStatut();

  const handleEmettre = async () => {
    try {
      await updateStatut.mutateAsync({
        id: facture.id,
        statut: "EMISE",
        dateEmise: new Date(),
      });
      setShowEmettreDialog(false);
      router.refresh();
    } catch (error: any) {
      alert("Erreur lors de l'émission de la facture: " + error.message);
    }
  };

  const handleAnnuler = async () => {
    if (!motifAnnulation.trim()) {
      alert("Veuillez indiquer un motif d'annulation");
      return;
    }

    try {
      await updateStatut.mutateAsync({
        id: facture.id,
        statut: "ANNULEE",
        dateAnnulation: new Date(),
        motifAnnulation: motifAnnulation.trim(),
      });
      setShowAnnulerDialog(false);
      router.refresh();
    } catch (error: any) {
      alert("Erreur lors de l'annulation de la facture: " + error.message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bouton Émettre */}
      {canEmettreFacture(facture) && (
        <Button
          onClick={() => setShowEmettreDialog(true)}
          className="bg-brand hover:bg-brand/90"
          disabled={updateStatut.isPending}
        >
          {updateStatut.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Émettre la facture
        </Button>
      )}

      {/* Bouton Annuler */}
      {canAnnulerFacture(facture) && (
        <Button
          onClick={() => setShowAnnulerDialog(true)}
          variant="destructive"
          disabled={updateStatut.isPending}
        >
          {updateStatut.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Annuler
        </Button>
      )}

      {/* Bouton Télécharger PDF (placeholder) */}
      {facture.statut !== "BROUILLON" && (
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Télécharger PDF
        </Button>
      )}

      {/* Dialog Émettre */}
      <AlertDialog open={showEmettreDialog} onOpenChange={setShowEmettreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Émettre la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'émettre la facture {facture.numero}.
              <br />
              <br />
              <strong className="text-yellow-600">
                ⚠ Attention :
              </strong>{" "}
              Une fois émise, la facture ne pourra plus être modifiée. Les
              totaux du client seront mis à jour automatiquement.
              <br />
              <br />
              Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatut.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmettre}
              disabled={updateStatut.isPending}
              className="bg-brand hover:bg-brand/90"
            >
              {updateStatut.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Oui, émettre la facture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Annuler */}
      <AlertDialog open={showAnnulerDialog} onOpenChange={setShowAnnulerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'annuler la facture {facture.numero}.
              <br />
              <br />
              {facture.bdlIds && facture.bdlIds.length > 0 && (
                <span className="text-yellow-600">
                  ⚠ Les bons de livraison associés seront déliés et pourront
                  être facturés à nouveau.
                  <br />
                  <br />
                </span>
              )}
              {(facture.statut === "EMISE" ||
                facture.statut === "PAYEE_PARTIELLE" ||
                facture.statut === "PAYEE") && (
                <span className="text-yellow-600">
                  ⚠ Les totaux du client seront ajustés automatiquement.
                  <br />
                  <br />
                </span>
              )}
              Cette action est irréversible. Veuillez indiquer le motif de
              l'annulation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="motif">
              Motif d'annulation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motif"
              placeholder="Expliquez pourquoi cette facture est annulée..."
              value={motifAnnulation}
              onChange={(e) => setMotifAnnulation(e.target.value)}
              rows={4}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatut.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnnuler}
              disabled={updateStatut.isPending || !motifAnnulation.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {updateStatut.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
