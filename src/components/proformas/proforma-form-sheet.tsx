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
import { useCreateProforma, useUpdateProforma } from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Proforma } from "@/lib/types/proforma";
import { LigneDocument } from "@/lib/types/common";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Schéma de validation avec Zod
const proformaFormSchema = z.object({
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  dateValidite: z.string().min(1, "La date de validité est requise"),
  notes: z.string().optional(),
  conditions: z.string().optional(),
});

type ProformaFormValues = z.infer<typeof proformaFormSchema>;

interface ProformaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proforma?: Proforma | null;
  userId: string;
}

export function ProformaFormSheet({
  open,
  onOpenChange,
  proforma,
  userId,
}: ProformaFormSheetProps) {
  const isEditing = !!proforma;
  const createMutation = useCreateProforma();
  const updateMutation = useUpdateProforma();
  const { data: clients } = useClients();

  const [lignes, setLignes] = useState<LigneDocument[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      clientId: "",
      dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // +30 jours
      notes: "",
      conditions: "",
    },
  });

  const clientId = watch("clientId");

  // Charger les données du proforma en mode édition
  useEffect(() => {
    if (proforma) {
      reset({
        clientId: proforma.clientId,
        dateValidite: proforma.dateValidite.toISOString().split("T")[0],
        notes: proforma.notes || "",
        conditions: proforma.conditions || "",
      });
      setLignes(proforma.lignes);
    } else {
      reset({
        clientId: "",
        dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "",
        conditions: "",
      });
      setLignes([]);
    }
  }, [proforma, reset]);

  const ajouterLigne = () => {
    const nouvelleLigne: LigneDocument = {
      id: `temp-${Date.now()}`,
      designation: "",
      quantite: 1,
      unite: "u",
      prixUnitaire: 0,
      montantHT: 0,
      tva: 18,
      montantTTC: 0,
    };
    setLignes([...lignes, nouvelleLigne]);
  };

  const supprimerLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const modifierLigne = (index: number, champ: keyof LigneDocument, valeur: any) => {
    const nouvellesLignes = [...lignes];
    const ligne = { ...nouvellesLignes[index], [champ]: valeur };

    // Recalculer les montants
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

  const onSubmit = async (data: ProformaFormValues) => {
    try {
      if (lignes.length === 0) {
        alert("Veuillez ajouter au moins une ligne");
        return;
      }

      const proformaData = {
        clientId: data.clientId,
        dateValidite: new Date(data.dateValidite),
        lignes: lignes.map(({ id, ...ligne }) => ({
          ...ligne,
          id: id.startsWith("temp-") ? undefined : id,
        })) as any,
        notes: data.notes,
        conditions: data.conditions,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: proforma.id,
          ...proformaData,
        });
      } else {
        await createMutation.mutateAsync({
          data: proformaData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
      setLignes([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du proforma:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier le proforma" : "Nouveau proforma"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations du proforma ci-dessous."
                : "Remplissez les informations du nouveau proforma."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Client */}
            <div className="grid gap-3">
              <Label htmlFor="clientId">
                Client <span className="text-red-600">*</span>
              </Label>
              <Select
                value={clientId}
                onValueChange={(value) => setValue("clientId", value)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-600">{errors.clientId.message}</p>
              )}
            </div>

            {/* Date de validité */}
            <div className="grid gap-3">
              <Label htmlFor="dateValidite">
                Date de validité <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateValidite"
                type="date"
                {...register("dateValidite")}
              />
              {errors.dateValidite && (
                <p className="text-sm text-red-600">{errors.dateValidite.message}</p>
              )}
            </div>

            {/* Lignes du proforma */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>
                  Lignes du proforma <span className="text-red-600">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={ajouterLigne}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>

              {lignes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  Aucune ligne ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
                </p>
              ) : (
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Désignation</th>
                        <th className="p-2 text-center w-20">Qté</th>
                        <th className="p-2 text-center w-16">Unité</th>
                        <th className="p-2 text-right w-28">P.U (FCFA)</th>
                        <th className="p-2 text-center w-16">TVA%</th>
                        <th className="p-2 text-right w-28">Montant TTC</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((ligne, index) => (
                        <tr key={ligne.id} className="border-t">
                          <td className="p-2">
                            <Input
                              value={ligne.designation}
                              onChange={(e) =>
                                modifierLigne(index, "designation", e.target.value)
                              }
                              placeholder="Description"
                              className="h-8"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) =>
                                modifierLigne(index, "quantite", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-center"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={ligne.unite}
                              onChange={(e) =>
                                modifierLigne(index, "unite", e.target.value)
                              }
                              placeholder="u"
                              className="h-8 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={ligne.prixUnitaire}
                              onChange={(e) =>
                                modifierLigne(index, "prixUnitaire", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-right"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={ligne.tva || 0}
                              onChange={(e) =>
                                modifierLigne(index, "tva", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-center"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {formatCurrency(ligne.montantTTC || ligne.montantHT)}
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => supprimerLigne(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totaux */}
              {lignes.length > 0 && (
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
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-3">
              <Label htmlFor="notes">Notes (Optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes générales..."
                {...register("notes")}
              />
            </div>

            {/* Conditions */}
            <div className="grid gap-3">
              <Label htmlFor="conditions">Conditions de vente (Optionnel)</Label>
              <Textarea
                id="conditions"
                placeholder="Conditions générales de vente..."
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
                "Créer le proforma"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
