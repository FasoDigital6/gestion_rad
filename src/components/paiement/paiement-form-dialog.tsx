"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAddPaiement } from "@/lib/hooks/use-paiement";
import { formatMontant } from "@/lib/utils/facture";
import {
  getModePaiementLabel,
  requiresBanque,
  requiresReference,
} from "@/lib/utils/paiement";
import type { Facture } from "@/lib/types/facture";
import type { ModePaiement } from "@/lib/types/paiement";

const paiementSchema = z.object({
  montant: z.number().positive("Le montant doit être supérieur à 0"),
  modePaiement: z.enum([
    "ESPECES",
    "CHEQUE",
    "VIREMENT",
    "MOBILE_MONEY",
    "CARTE",
    "AUTRE",
  ]),
  datePaiement: z.string().min(1, "La date de paiement est requise"),
  referencePaiement: z.string().optional(),
  banque: z.string().optional(),
  notes: z.string().optional(),
});

type PaiementFormData = z.infer<typeof paiementSchema>;

interface PaiementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: Facture;
}

const modesPaiement: ModePaiement[] = [
  "ESPECES",
  "CHEQUE",
  "VIREMENT",
  "MOBILE_MONEY",
  "CARTE",
  "AUTRE",
];

export function PaiementFormDialog({
  open,
  onOpenChange,
  facture,
}: PaiementFormDialogProps) {
  const [selectedMode, setSelectedMode] = useState<ModePaiement>("ESPECES");
  const addPaiement = useAddPaiement();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      montant: facture.soldeRestant,
      modePaiement: "ESPECES",
      datePaiement: new Date().toISOString().split("T")[0],
    },
  });

  const montant = watch("montant");

  const onSubmit = async (data: PaiementFormData) => {
    try {
      // Validation du montant
      if (data.montant > facture.soldeRestant) {
        alert(
          `Le montant ne peut pas dépasser le solde restant (${formatMontant(facture.soldeRestant)})`
        );
        return;
      }

      await addPaiement.mutateAsync({
        factureId: facture.id,
        montant: data.montant,
        modePaiement: data.modePaiement,
        datePaiement: new Date(data.datePaiement),
        referencePaiement: data.referencePaiement,
        banque: data.banque,
        notes: data.notes,
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      alert("Erreur lors de l'ajout du paiement: " + error.message);
    }
  };

  const handleModeChange = (mode: ModePaiement) => {
    setSelectedMode(mode);
    setValue("modePaiement", mode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un paiement</DialogTitle>
          <DialogDescription>
            Facture {facture.numero} - Solde restant:{" "}
            <span className="font-bold text-red-600">
              {formatMontant(facture.soldeRestant)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="montant">
              Montant du paiement <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-1">
              <Input
                id="montant"
                type="number"
                step="0.01"
                {...register("montant", { valueAsNumber: true })}
                className="text-lg font-semibold"
              />
              {errors.montant && (
                <p className="text-sm text-red-500">{errors.montant.message}</p>
              )}
              {montant > facture.soldeRestant && (
                <p className="text-sm text-red-500">
                  Le montant dépasse le solde restant
                </p>
              )}
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="space-y-2">
            <Label htmlFor="modePaiement">
              Mode de paiement <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedMode}
              onValueChange={(value) => handleModeChange(value as ModePaiement)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modesPaiement.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {getModePaiementLabel(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date de paiement */}
          <div className="space-y-2">
            <Label htmlFor="datePaiement">
              Date de paiement <span className="text-red-500">*</span>
            </Label>
            <Input id="datePaiement" type="date" {...register("datePaiement")} />
            {errors.datePaiement && (
              <p className="text-sm text-red-500">
                {errors.datePaiement.message}
              </p>
            )}
          </div>

          {/* Référence (conditionnelle) */}
          {requiresReference(selectedMode) && (
            <div className="space-y-2">
              <Label htmlFor="referencePaiement">
                Référence (N° chèque, N° transaction)
              </Label>
              <Input
                id="referencePaiement"
                placeholder="Entrez la référence"
                {...register("referencePaiement")}
              />
            </div>
          )}

          {/* Banque (conditionnelle) */}
          {requiresBanque(selectedMode) && (
            <div className="space-y-2">
              <Label htmlFor="banque">Banque</Label>
              <Input
                id="banque"
                placeholder="Nom de la banque"
                {...register("banque")}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles sur ce paiement"
              rows={3}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addPaiement.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={addPaiement.isPending || montant > facture.soldeRestant}
              className="bg-brand hover:bg-brand/90"
            >
              {addPaiement.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
