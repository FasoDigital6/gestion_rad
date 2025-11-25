"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateFacture, useUpdateFacture } from "@/lib/hooks/use-factures";
import { useBDCs } from "@/lib/hooks/use-bdc";
import { useBLs } from "@/lib/hooks/use-bl";
import { Facture } from "@/lib/types/facture";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Schéma de validation avec Zod
const factureFormSchema = z.object({
  bdcId: z.string().min(1, "Veuillez sélectionner un BDC"),
  blIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins un BL"),
  dateFacture: z.string().min(1, "La date de facture est requise"),
  delaiPaiementJours: z.coerce.number().min(0, "Le délai doit être positif"),
  notes: z.string().optional(),
  conditions: z.string().optional(),
});

type FactureFormValues = z.infer<typeof factureFormSchema>;

interface FactureFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture?: Facture | null;
  userId: string;
}

export function FactureFormSheet({
  open,
  onOpenChange,
  facture,
  userId,
}: FactureFormSheetProps) {
  const isEditing = !!facture;
  const createMutation = useCreateFacture();
  const updateMutation = useUpdateFacture();
  const { data: bdcs } = useBDCs();
  const { data: bls } = useBLs();

  const [selectedBLIds, setSelectedBLIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FactureFormValues>({
    resolver: zodResolver(factureFormSchema),
    defaultValues: {
      bdcId: "",
      blIds: [],
      dateFacture: new Date().toISOString().split("T")[0],
      delaiPaiementJours: 30,
      notes: "",
      conditions: "",
    },
  });

  const bdcId = watch("bdcId");

  // Filtrer les BDC qui ont des BL livrés
  const bdcsDisponibles = bdcs?.filter(
    (b) => b.statut !== "annule" && b.bls.length > 0
  ) || [];

  // Filtrer les BL du BDC sélectionné qui ne sont pas encore facturés
  const blsDisponibles = bls?.filter(
    (bl) => bl.bdcId === bdcId && !bl.estFacture && bl.statut === "livre"
  ) || [];

  // Charger les données de la facture en mode édition
  useEffect(() => {
    if (facture) {
      const blIds = facture.bls.map((bl) => bl.id);
      reset({
        bdcId: facture.bdcId,
        blIds,
        dateFacture: facture.dateFacture.toISOString().split("T")[0],
        delaiPaiementJours: facture.delaiPaiementJours,
        notes: facture.notes || "",
        conditions: facture.conditions || "",
      });
      setSelectedBLIds(blIds);
    } else {
      reset({
        bdcId: "",
        blIds: [],
        dateFacture: new Date().toISOString().split("T")[0],
        delaiPaiementJours: 30,
        notes: "",
        conditions: "",
      });
      setSelectedBLIds([]);
    }
  }, [facture, reset]);

  // Réinitialiser les BL sélectionnés quand le BDC change
  useEffect(() => {
    if (bdcId && !isEditing) {
      setSelectedBLIds([]);
      setValue("blIds", []);
    }
  }, [bdcId, setValue, isEditing]);

  const toggleBL = (blId: string) => {
    const newSelected = selectedBLIds.includes(blId)
      ? selectedBLIds.filter((id) => id !== blId)
      : [...selectedBLIds, blId];

    setSelectedBLIds(newSelected);
    setValue("blIds", newSelected);
  };

  // Calculer les totaux des BL sélectionnés
  const blsSelectionnes = bls?.filter((bl) => selectedBLIds.includes(bl.id)) || [];
  const totalHT = blsSelectionnes.reduce((sum, bl) => sum + bl.totalHT, 0);
  const totalTVA = blsSelectionnes.reduce((sum, bl) => sum + bl.totalTVA, 0);
  const totalTTC = blsSelectionnes.reduce((sum, bl) => sum + bl.totalTTC, 0);

  const selectedBDC = bdcs?.find((b) => b.id === bdcId);

  const onSubmit = async (data: FactureFormValues) => {
    try {
      if (data.blIds.length === 0) {
        alert("Veuillez sélectionner au moins un BL");
        return;
      }

      const factureData = {
        bdcId: data.bdcId,
        blIds: data.blIds,
        dateFacture: new Date(data.dateFacture),
        delaiPaiementJours: data.delaiPaiementJours,
        notes: data.notes,
        conditions: data.conditions,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: facture.id,
          ...factureData,
        });
      } else {
        await createMutation.mutateAsync({
          data: factureData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
      setSelectedBLIds([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la facture:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier la facture" : "Nouvelle Facture"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations de la facture ci-dessous."
                : "Remplissez les informations de la nouvelle facture."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* BDC */}
            <div className="grid gap-3">
              <Label htmlFor="bdcId">
                Bon de Commande <span className="text-red-600">*</span>
              </Label>
              <Select
                value={bdcId}
                onValueChange={(value) => setValue("bdcId", value)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un BDC" />
                </SelectTrigger>
                <SelectContent>
                  {bdcsDisponibles.map((bdc) => (
                    <SelectItem key={bdc.id} value={bdc.id}>
                      {bdc.numero} - {bdc.clientNom} ({bdc.bls.length} BL)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bdcId && (
                <p className="text-sm text-red-600">{errors.bdcId.message}</p>
              )}
              {selectedBDC && (
                <p className="text-sm text-muted-foreground">
                  Client: {selectedBDC.clientNom} | Total BDC: {formatCurrency(selectedBDC.totalTTC)}
                </p>
              )}
            </div>

            {/* Bons de Livraison */}
            {bdcId && blsDisponibles.length > 0 && (
              <div className="grid gap-3">
                <Label>
                  Bons de Livraison à facturer <span className="text-red-600">*</span>
                </Label>
                <div className="border rounded-md p-4 space-y-3 max-h-64 overflow-y-auto">
                  {blsDisponibles.map((bl) => (
                    <div key={bl.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`bl-${bl.id}`}
                        checked={selectedBLIds.includes(bl.id)}
                        onCheckedChange={() => toggleBL(bl.id)}
                        disabled={isEditing}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`bl-${bl.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {bl.numero} - {format(bl.dateLivraison, "dd/MM/yyyy", { locale: fr })}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(bl.totalTTC)} | {bl.typeLivraison === "complete" ? "Complète" : "Partielle"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.blIds && (
                  <p className="text-sm text-red-600">{errors.blIds.message}</p>
                )}
              </div>
            )}

            {bdcId && blsDisponibles.length === 0 && (
              <div className="border rounded-md p-4 text-center text-muted-foreground">
                Aucun BL disponible pour facturation. Tous les BL ont déjà été facturés ou sont en préparation.
              </div>
            )}

            {/* Récapitulatif des BL sélectionnés */}
            {selectedBLIds.length > 0 && (
              <div className="border rounded-md p-4 bg-muted/50">
                <h4 className="font-medium mb-3">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>BL sélectionnés:</span>
                    <span className="font-medium">{selectedBLIds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total HT:</span>
                    <span className="font-medium">{formatCurrency(totalHT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total TVA:</span>
                    <span className="font-medium">{formatCurrency(totalTVA)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total TTC:</span>
                    <span>{formatCurrency(totalTTC)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Date de facture */}
            <div className="grid gap-3">
              <Label htmlFor="dateFacture">
                Date de facture <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateFacture"
                type="date"
                {...register("dateFacture")}
              />
              {errors.dateFacture && (
                <p className="text-sm text-red-600">{errors.dateFacture.message}</p>
              )}
            </div>

            {/* Délai de paiement */}
            <div className="grid gap-3">
              <Label htmlFor="delaiPaiementJours">
                Délai de paiement (jours) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="delaiPaiementJours"
                type="number"
                min="0"
                {...register("delaiPaiementJours")}
              />
              {errors.delaiPaiementJours && (
                <p className="text-sm text-red-600">{errors.delaiPaiementJours.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Date d'échéance:{" "}
                {format(
                  new Date(new Date(watch("dateFacture")).getTime() + watch("delaiPaiementJours") * 24 * 60 * 60 * 1000),
                  "dd/MM/yyyy",
                  { locale: fr }
                )}
              </p>
            </div>

            {/* Notes */}
            <div className="grid gap-3">
              <Label htmlFor="notes">Notes (Optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes sur la facture..."
                {...register("notes")}
              />
            </div>

            {/* Conditions de paiement */}
            <div className="grid gap-3">
              <Label htmlFor="conditions">Conditions de paiement (Optionnel)</Label>
              <Textarea
                id="conditions"
                placeholder="Conditions générales de paiement..."
                {...register("conditions")}
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
                "Créer la facture"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
