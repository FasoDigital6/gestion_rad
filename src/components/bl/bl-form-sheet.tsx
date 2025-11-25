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
import { useCreateBL, useUpdateBL } from "@/lib/hooks/use-bl";
import { useBDCs } from "@/lib/hooks/use-bdc";
import { BonDeLivraison } from "@/lib/types/bl";
import { LigneDocument } from "@/lib/types/common";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Schéma de validation avec Zod
const blFormSchema = z.object({
  bdcId: z.string().min(1, "Veuillez sélectionner un BDC"),
  dateLivraison: z.string().min(1, "La date de livraison est requise"),
  dateLivraisonPrevue: z.string().optional(),
  typeLivraison: z.enum(["complete", "partielle"]),
  lieuLivraison: z.string().optional(),
  receptionnePar: z.string().optional(),
  notes: z.string().optional(),
});

type BLFormValues = z.infer<typeof blFormSchema>;

interface BLFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bl?: BonDeLivraison | null;
  userId: string;
}

export function BLFormSheet({
  open,
  onOpenChange,
  bl,
  userId,
}: BLFormSheetProps) {
  const isEditing = !!bl;
  const createMutation = useCreateBL();
  const updateMutation = useUpdateBL();
  const { data: bdcs } = useBDCs();

  const [lignes, setLignes] = useState<LigneDocument[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BLFormValues>({
    resolver: zodResolver(blFormSchema),
    defaultValues: {
      bdcId: "",
      dateLivraison: new Date().toISOString().split("T")[0],
      dateLivraisonPrevue: "",
      typeLivraison: "complete",
      lieuLivraison: "",
      receptionnePar: "",
      notes: "",
    },
  });

  const bdcId = watch("bdcId");
  const typeLivraison = watch("typeLivraison");

  // Filtrer les BDC en cours ou terminés (non annulés)
  const bdcsDisponibles = bdcs?.filter(
    (b) => (b.statut === "recu" || b.statut === "en_cours") && b.quantiteRestante > 0
  ) || [];

  // Charger les données du BL en mode édition
  useEffect(() => {
    if (bl) {
      reset({
        bdcId: bl.bdcId,
        dateLivraison: bl.dateLivraison.toISOString().split("T")[0],
        dateLivraisonPrevue: bl.dateLivraisonPrevue?.toISOString().split("T")[0] || "",
        typeLivraison: bl.typeLivraison,
        lieuLivraison: bl.lieuLivraison || "",
        receptionnePar: bl.receptionnePar || "",
        notes: bl.notes || "",
      });
      setLignes(bl.lignes);
    } else {
      reset({
        bdcId: "",
        dateLivraison: new Date().toISOString().split("T")[0],
        dateLivraisonPrevue: "",
        typeLivraison: "complete",
        lieuLivraison: "",
        receptionnePar: "",
        notes: "",
      });
      setLignes([]);
    }
  }, [bl, reset]);

  // Charger les lignes du BDC sélectionné
  useEffect(() => {
    if (bdcId && !isEditing) {
      const bdc = bdcs?.find((b) => b.id === bdcId);
      if (bdc) {
        setLignes(bdc.lignes.map((ligne) => ({ ...ligne })));
      }
    }
  }, [bdcId, bdcs, isEditing]);

  const modifierQuantiteLigne = (index: number, quantite: number) => {
    const nouvellesLignes = [...lignes];
    const ligne = { ...nouvellesLignes[index] };

    ligne.quantite = quantite;
    ligne.montantHT = ligne.quantite * ligne.prixUnitaire;
    if (ligne.tva !== undefined) {
      ligne.montantTTC = ligne.montantHT * (1 + ligne.tva / 100);
    } else {
      ligne.montantTTC = ligne.montantHT;
    }

    nouvellesLignes[index] = ligne;
    setLignes(nouvellesLignes);
  };

  // Calculer les totaux
  const totalHT = lignes.reduce((sum, ligne) => sum + ligne.montantHT, 0);
  const totalTVA = lignes.reduce(
    (sum, ligne) => sum + (ligne.montantTTC || ligne.montantHT) - ligne.montantHT,
    0
  );
  const totalTTC = lignes.reduce((sum, ligne) => sum + (ligne.montantTTC || ligne.montantHT), 0);

  const selectedBDC = bdcs?.find((b) => b.id === bdcId);

  const onSubmit = async (data: BLFormValues) => {
    try {
      if (lignes.length === 0) {
        alert("Veuillez sélectionner un BDC");
        return;
      }

      const blData = {
        bdcId: data.bdcId,
        dateLivraison: new Date(data.dateLivraison),
        dateLivraisonPrevue: data.dateLivraisonPrevue ? new Date(data.dateLivraisonPrevue) : undefined,
        lignes: lignes.map(({ id, ...ligne }) => ({
          ...ligne,
          id: id.startsWith("temp-") ? undefined : id,
        })) as any,
        typeLivraison: data.typeLivraison,
        lieuLivraison: data.lieuLivraison,
        receptionnePar: data.receptionnePar,
        notes: data.notes,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: bl.id,
          ...blData,
        });
      } else {
        await createMutation.mutateAsync({
          data: blData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
      setLignes([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du BL:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier le BL" : "Nouveau Bon de Livraison"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations du BL ci-dessous."
                : "Remplissez les informations du nouveau BL."}
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
                      {bdc.numero} - {bdc.clientNom} ({formatCurrency(bdc.totalTTC)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bdcId && (
                <p className="text-sm text-red-600">{errors.bdcId.message}</p>
              )}
              {selectedBDC && (
                <p className="text-sm text-muted-foreground">
                  Qté commandée: {selectedBDC.quantiteCommandee} |
                  Livrée: {selectedBDC.quantiteLivree} |
                  Restante: {selectedBDC.quantiteRestante}
                </p>
              )}
            </div>

            {/* Type de livraison */}
            <div className="grid gap-3">
              <Label htmlFor="typeLivraison">
                Type de livraison <span className="text-red-600">*</span>
              </Label>
              <Select
                value={typeLivraison}
                onValueChange={(value) =>
                  setValue("typeLivraison", value as "complete" | "partielle")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Livraison complète</SelectItem>
                  <SelectItem value="partielle">Livraison partielle</SelectItem>
                </SelectContent>
              </Select>
              {errors.typeLivraison && (
                <p className="text-sm text-red-600">{errors.typeLivraison.message}</p>
              )}
            </div>

            {/* Date de livraison */}
            <div className="grid gap-3">
              <Label htmlFor="dateLivraison">
                Date de livraison <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateLivraison"
                type="date"
                {...register("dateLivraison")}
              />
              {errors.dateLivraison && (
                <p className="text-sm text-red-600">{errors.dateLivraison.message}</p>
              )}
            </div>

            {/* Date de livraison prévue */}
            <div className="grid gap-3">
              <Label htmlFor="dateLivraisonPrevue">Date prévue (Optionnel)</Label>
              <Input
                id="dateLivraisonPrevue"
                type="date"
                {...register("dateLivraisonPrevue")}
              />
            </div>

            {/* Lieu de livraison */}
            <div className="grid gap-3">
              <Label htmlFor="lieuLivraison">Lieu de livraison (Optionnel)</Label>
              <Input
                id="lieuLivraison"
                placeholder="Ex: Entrepôt principal, Ouagadougou"
                {...register("lieuLivraison")}
              />
            </div>

            {/* Réceptionné par */}
            <div className="grid gap-3">
              <Label htmlFor="receptionnePar">Réceptionné par (Optionnel)</Label>
              <Input
                id="receptionnePar"
                placeholder="Nom de la personne qui réceptionne"
                {...register("receptionnePar")}
              />
            </div>

            {/* Lignes du BL */}
            {lignes.length > 0 && (
              <div className="grid gap-3">
                <Label>
                  Quantités à livrer <span className="text-red-600">*</span>
                </Label>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-center w-24">Qté BDC</th>
                        <th className="p-2 text-center w-24">Qté à livrer</th>
                        <th className="p-2 text-right w-28">P.U (FCFA)</th>
                        <th className="p-2 text-right w-28">Montant TTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((ligne, index) => {
                        const ligneBDC = selectedBDC?.lignes[index];
                        return (
                          <tr key={ligne.id} className="border-t">
                            <td className="p-2">{ligne.designation}</td>
                            <td className="p-2 text-center font-medium">
                              {ligneBDC?.quantite || ligne.quantite}
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={ligne.quantite}
                                onChange={(e) =>
                                  modifierQuantiteLigne(index, parseFloat(e.target.value) || 0)
                                }
                                className="h-8 text-center"
                                min="0"
                                max={ligneBDC?.quantite || ligne.quantite}
                                step="0.01"
                              />
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(ligne.prixUnitaire)}
                            </td>
                            <td className="p-2 text-right font-medium">
                              {formatCurrency(ligne.montantTTC || ligne.montantHT)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="border rounded-md p-4 bg-muted/50">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Total HT:</span>
                      <span className="font-medium">{formatCurrency(totalHT)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total TVA:</span>
                      <span className="font-medium">{formatCurrency(totalTVA)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total TTC:</span>
                      <span>{formatCurrency(totalTTC)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="grid gap-3">
              <Label htmlFor="notes">Notes (Optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes sur la livraison..."
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
                "Créer le BL"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
