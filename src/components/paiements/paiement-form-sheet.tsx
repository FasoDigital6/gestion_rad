"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePaiement, useUpdatePaiement } from "@/lib/hooks/use-paiements";
import { useFactures } from "@/lib/hooks/use-factures";
import { Paiement } from "@/lib/types/paiement";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Schéma de validation avec Zod
const paiementFormSchema = z.object({
  factureId: z.string().min(1, "Veuillez sélectionner une facture"),
  montant: z.coerce.number().positive("Le montant doit être positif"),
  datePaiement: z.string().min(1, "La date de paiement est requise"),
  dateValeur: z.string().optional(),
  modePaiement: z.enum(["especes", "cheque", "virement", "carte", "mobile_money", "autre"]),
  reference: z.string().optional(),
  banque: z.string().optional(),
  notes: z.string().optional(),
});

type PaiementFormValues = z.infer<typeof paiementFormSchema>;

interface PaiementFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paiement?: Paiement | null;
  userId: string;
}

export function PaiementFormSheet({
  open,
  onOpenChange,
  paiement,
  userId,
}: PaiementFormSheetProps) {
  const isEditing = !!paiement;
  const createMutation = useCreatePaiement();
  const updateMutation = useUpdatePaiement();
  const { data: factures } = useFactures();

  // Filter factures non complètement payées
  const facturesNonPayees = factures?.filter(
    (f) => f.montantRestant > 0 && f.statut !== "annulee"
  ) || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PaiementFormValues>({
    resolver: zodResolver(paiementFormSchema),
    defaultValues: {
      factureId: "",
      montant: 0,
      datePaiement: new Date().toISOString().split("T")[0],
      dateValeur: "",
      modePaiement: "especes",
      reference: "",
      banque: "",
      notes: "",
    },
  });

  const factureId = watch("factureId");
  const modePaiement = watch("modePaiement");

  // Charger les données du paiement en mode édition
  useEffect(() => {
    if (paiement) {
      reset({
        factureId: paiement.factureId,
        montant: paiement.montant,
        datePaiement: paiement.datePaiement.toISOString().split("T")[0],
        dateValeur: paiement.dateValeur?.toISOString().split("T")[0] || "",
        modePaiement: paiement.modePaiement,
        reference: paiement.reference || "",
        banque: paiement.banque || "",
        notes: paiement.notes || "",
      });
    } else {
      reset({
        factureId: "",
        montant: 0,
        datePaiement: new Date().toISOString().split("T")[0],
        dateValeur: "",
        modePaiement: "especes",
        reference: "",
        banque: "",
        notes: "",
      });
    }
  }, [paiement, reset]);

  const selectedFacture = factures?.find((f) => f.id === factureId);

  const onSubmit = async (data: PaiementFormValues) => {
    try {
      const paiementData = {
        factureId: data.factureId,
        montant: data.montant,
        datePaiement: new Date(data.datePaiement),
        dateValeur: data.dateValeur ? new Date(data.dateValeur) : undefined,
        modePaiement: data.modePaiement,
        reference: data.reference,
        banque: data.banque,
        notes: data.notes,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: paiement.id,
          ...paiementData,
        });
      } else {
        await createMutation.mutateAsync({
          data: paiementData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier le paiement" : "Nouveau paiement"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations du paiement ci-dessous."
                : "Remplissez les informations du nouveau paiement."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Facture */}
            <div className="grid gap-3">
              <Label htmlFor="factureId">
                Facture <span className="text-red-600">*</span>
              </Label>
              <Select
                value={factureId}
                onValueChange={(value) => {
                  setValue("factureId", value);
                  const facture = factures?.find((f) => f.id === value);
                  if (facture && !isEditing) {
                    setValue("montant", facture.montantRestant);
                  }
                }}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une facture" />
                </SelectTrigger>
                <SelectContent>
                  {facturesNonPayees.map((facture) => (
                    <SelectItem key={facture.id} value={facture.id}>
                      {facture.numero} - {facture.clientNom} ({formatCurrency(facture.montantRestant)} restant)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.factureId && (
                <p className="text-sm text-red-600">{errors.factureId.message}</p>
              )}
              {selectedFacture && (
                <p className="text-sm text-muted-foreground">
                  Montant total: {formatCurrency(selectedFacture.totalTTC)} |
                  Restant à payer: {formatCurrency(selectedFacture.montantRestant)}
                </p>
              )}
            </div>

            {/* Montant */}
            <div className="grid gap-3">
              <Label htmlFor="montant">
                Montant (FCFA) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("montant")}
              />
              {errors.montant && (
                <p className="text-sm text-red-600">{errors.montant.message}</p>
              )}
            </div>

            {/* Date de paiement */}
            <div className="grid gap-3">
              <Label htmlFor="datePaiement">
                Date de paiement <span className="text-red-600">*</span>
              </Label>
              <Input
                id="datePaiement"
                type="date"
                {...register("datePaiement")}
              />
              {errors.datePaiement && (
                <p className="text-sm text-red-600">{errors.datePaiement.message}</p>
              )}
            </div>

            {/* Mode de paiement */}
            <div className="grid gap-3">
              <Label htmlFor="modePaiement">
                Mode de paiement <span className="text-red-600">*</span>
              </Label>
              <Select
                value={modePaiement}
                onValueChange={(value) =>
                  setValue("modePaiement", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="carte">Carte bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {errors.modePaiement && (
                <p className="text-sm text-red-600">{errors.modePaiement.message}</p>
              )}
            </div>

            {/* Référence - Afficher seulement pour certains modes */}
            {(modePaiement === "cheque" || modePaiement === "virement" || modePaiement === "carte") && (
              <div className="grid gap-3">
                <Label htmlFor="reference">
                  Référence {modePaiement === "cheque" ? "(N° chèque)" : modePaiement === "virement" ? "(Référence virement)" : "(N° transaction)"}
                </Label>
                <Input
                  id="reference"
                  placeholder={
                    modePaiement === "cheque"
                      ? "Ex: 1234567"
                      : modePaiement === "virement"
                      ? "Ex: VIR-2024-001"
                      : "Ex: TRX-123456"
                  }
                  {...register("reference")}
                />
              </div>
            )}

            {/* Banque - Afficher pour chèque et virement */}
            {(modePaiement === "cheque" || modePaiement === "virement") && (
              <div className="grid gap-3">
                <Label htmlFor="banque">Banque</Label>
                <Input
                  id="banque"
                  placeholder="Ex: Coris Bank"
                  {...register("banque")}
                />
              </div>
            )}

            {/* Date de valeur - Pour chèques et virements */}
            {(modePaiement === "cheque" || modePaiement === "virement") && (
              <div className="grid gap-3">
                <Label htmlFor="dateValeur">Date de valeur</Label>
                <Input
                  id="dateValeur"
                  type="date"
                  {...register("dateValeur")}
                />
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-3">
              <Label htmlFor="notes">Notes (Optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires..."
                {...register("notes")}
              />
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Annuler
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : isEditing ? (
                "Mettre à jour"
              ) : (
                "Créer le paiement"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
