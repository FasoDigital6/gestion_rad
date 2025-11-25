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
import { useCreateBDC, useUpdateBDC } from "@/lib/hooks/use-bdc";
import { useClients } from "@/lib/hooks/use-clients";
import { useProformas } from "@/lib/hooks/use-proformas";
import { BonDeCommande } from "@/lib/types/bdc";
import { LigneDocument } from "@/lib/types/common";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Schéma de validation avec Zod
const bdcFormSchema = z.object({
  numeroBDCClient: z.string().min(1, "Le numéro BDC client est requis"),
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  dateCommande: z.string().min(1, "La date de commande est requise"),
  proformaId: z.string().optional(),
  notes: z.string().optional(),
});

type BDCFormValues = z.infer<typeof bdcFormSchema>;

interface BDCFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bdc?: BonDeCommande | null;
  userId: string;
}

export function BDCFormSheet({
  open,
  onOpenChange,
  bdc,
  userId,
}: BDCFormSheetProps) {
  const isEditing = !!bdc;
  const createMutation = useCreateBDC();
  const updateMutation = useUpdateBDC();
  const { data: clients } = useClients();
  const { data: proformas } = useProformas();

  const [lignes, setLignes] = useState<LigneDocument[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BDCFormValues>({
    resolver: zodResolver(bdcFormSchema),
    defaultValues: {
      numeroBDCClient: "",
      clientId: "",
      dateCommande: new Date().toISOString().split("T")[0],
      proformaId: "",
      notes: "",
    },
  });

  const clientId = watch("clientId");
  const proformaId = watch("proformaId");

  // Filtrer les proformas acceptés du client sélectionné
  const proformasClient = proformas?.filter(
    (p) => p.clientId === clientId && p.statut === "accepte" && !p.bdcId
  ) || [];

  // Charger les données du BDC en mode édition
  useEffect(() => {
    if (bdc) {
      reset({
        numeroBDCClient: bdc.numeroBDCClient,
        clientId: bdc.clientId,
        dateCommande: bdc.dateCommande.toISOString().split("T")[0],
        proformaId: bdc.proformaId || "",
        notes: bdc.notes || "",
      });
      setLignes(bdc.lignes);
    } else {
      reset({
        numeroBDCClient: "",
        clientId: "",
        dateCommande: new Date().toISOString().split("T")[0],
        proformaId: "",
        notes: "",
      });
      setLignes([]);
    }
  }, [bdc, reset]);

  // Charger les lignes du proforma sélectionné
  useEffect(() => {
    if (proformaId && !isEditing) {
      const proforma = proformas?.find((p) => p.id === proformaId);
      if (proforma) {
        setLignes(proforma.lignes);
      }
    }
  }, [proformaId, proformas, isEditing]);

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

  const onSubmit = async (data: BDCFormValues) => {
    try {
      if (lignes.length === 0) {
        alert("Veuillez ajouter au moins une ligne");
        return;
      }

      const bdcData = {
        numeroBDCClient: data.numeroBDCClient,
        clientId: data.clientId,
        dateCommande: new Date(data.dateCommande),
        lignes: lignes.map(({ id, ...ligne }) => ({
          ...ligne,
          id: id.startsWith("temp-") ? undefined : id,
        })) as any,
        notes: data.notes,
        proformaId: data.proformaId || undefined,
        sourceCreation: (data.proformaId ? "proforma" : "manuel") as "proforma" | "manuel",
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: bdc.id,
          ...bdcData,
        });
      } else {
        await createMutation.mutateAsync({
          data: bdcData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
      setLignes([]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du BDC:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier le BDC" : "Nouveau Bon de Commande"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations du BDC ci-dessous."
                : "Remplissez les informations du nouveau BDC."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Numéro BDC Client */}
            <div className="grid gap-3">
              <Label htmlFor="numeroBDCClient">
                N° BDC Client <span className="text-red-600">*</span>
              </Label>
              <Input
                id="numeroBDCClient"
                placeholder="Ex: BC-2024-001"
                {...register("numeroBDCClient")}
              />
              {errors.numeroBDCClient && (
                <p className="text-sm text-red-600">{errors.numeroBDCClient.message}</p>
              )}
            </div>

            {/* Client */}
            <div className="grid gap-3">
              <Label htmlFor="clientId">
                Client <span className="text-red-600">*</span>
              </Label>
              <Select
                value={clientId}
                onValueChange={(value) => {
                  setValue("clientId", value);
                  setValue("proformaId", ""); // Reset proforma when client changes
                }}
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

            {/* Proforma (optionnel) */}
            {clientId && proformasClient.length > 0 && (
              <div className="grid gap-3">
                <Label htmlFor="proformaId">
                  Créer depuis un proforma (Optionnel)
                </Label>
                <Select
                  value={proformaId}
                  onValueChange={(value) => setValue("proformaId", value)}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un proforma (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun (Saisie manuelle)</SelectItem>
                    {proformasClient.map((proforma) => (
                      <SelectItem key={proforma.id} value={proforma.id}>
                        {proforma.numero} - {formatCurrency(proforma.totalTTC)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {proformaId && (
                  <p className="text-sm text-muted-foreground">
                    Les lignes du proforma seront copiées automatiquement.
                  </p>
                )}
              </div>
            )}

            {/* Date de commande */}
            <div className="grid gap-3">
              <Label htmlFor="dateCommande">
                Date de commande <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateCommande"
                type="date"
                {...register("dateCommande")}
              />
              {errors.dateCommande && (
                <p className="text-sm text-red-600">{errors.dateCommande.message}</p>
              )}
            </div>

            {/* Lignes du BDC */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>
                  Lignes du BDC <span className="text-red-600">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={ajouterLigne}
                  disabled={!!proformaId && !isEditing}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>

              {lignes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                  {proformaId
                    ? "Les lignes du proforma seront chargées automatiquement."
                    : "Aucune ligne ajoutée. Cliquez sur \"Ajouter une ligne\" pour commencer."}
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
                "Créer le BDC"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
