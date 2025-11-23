"use client";

import { use, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProforma, useUpdateProforma } from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Schéma de validation
const proformaFormSchema = z.object({
  numeroDA: z.string().min(3, "Le numéro DA doit contenir au moins 3 caractères"),
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  dateLivraison: z.string().min(1, "Veuillez indiquer le délai de livraison"),
  lignes: z
    .array(
      z.object({
        designation: z.string().min(1, "La désignation est obligatoire"),
        unite: z.string().min(1, "L'unité est obligatoire"),
        quantite: z.number().min(1, "La quantité doit être supérieure à 0"),
        prixUnitaire: z.number().min(0, "Le prix unitaire doit être positif"),
      })
    )
    .min(1, "Au moins une ligne est requise"),
  remisePourcentage: z.number().min(0).max(100).optional(),
});

type ProformaFormValues = z.infer<typeof proformaFormSchema>;

export default function ModifierProformaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proforma, isLoading: loadingProforma } = useProforma(id);
  const updateMutation = useUpdateProforma();
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      numeroDA: "",
      clientId: "",
      dateLivraison: "",
      lignes: [],
      remisePourcentage: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const lignes = watch("lignes");
  const remisePourcentage = watch("remisePourcentage") || 0;
  const clientId = watch("clientId");

  // Charger les données du proforma
  useEffect(() => {
    if (proforma) {
      reset({
        numeroDA: proforma.numeroDA,
        clientId: proforma.clientId,
        dateLivraison: proforma.dateLivraison,
        lignes: proforma.lignes.map((ligne) => ({
          designation: ligne.designation,
          unite: ligne.unite,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prixUnitaire,
        })),
        remisePourcentage: proforma.remisePourcentage,
      });
    }
  }, [proforma, reset]);

  // Calcul des totaux
  const total = lignes.reduce(
    (sum, ligne) => sum + (ligne.quantite || 0) * (ligne.prixUnitaire || 0),
    0
  );
  const remiseMontant = (total * remisePourcentage) / 100;
  const totalNet = total - remiseMontant;

  const clientNom = clients?.find((c) => c.id === clientId)?.nom || "";

  const onSubmit = async (data: ProformaFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        ...data,
        clientNom,
      });
      router.push(`/proformas/${id}`);
    } catch (error) {
      console.error("Erreur lors de la modification du proforma:", error);
      alert("Erreur lors de la modification");
    }
  };

  if (loadingProforma) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!proforma || proforma.statut !== "BROUILLON") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">
          Ce proforma ne peut pas être modifié (statut: {proforma?.statut})
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Modifier le proforma {proforma.numero}
        </h1>
        <p className="text-base text-gray-500">
          Modifiez les informations du devis
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Informations client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations client</CardTitle>
            <CardDescription>
              Sélectionnez le client et les détails du proforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select value={clientId} onValueChange={(value) => setValue("clientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
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

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  value={new Date().toISOString().split("T")[0]}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Numéro DA */}
              <div className="space-y-2">
                <Label htmlFor="numeroDA">Numéro DA</Label>
                <Input
                  id="numeroDA"
                  placeholder="DA2507SIM099"
                  {...register("numeroDA")}
                />
                {errors.numeroDA && (
                  <p className="text-sm text-red-600">{errors.numeroDA.message}</p>
                )}
              </div>

              {/* Délai de livraison */}
              <div className="space-y-2">
                <Label htmlFor="dateLivraison">Délai de livraison</Label>
                <Input
                  id="dateLivraison"
                  placeholder="2 semaines après la réception de la Commande"
                  {...register("dateLivraison")}
                />
                {errors.dateLivraison && (
                  <p className="text-sm text-red-600">{errors.dateLivraison.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Articles et prestations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Articles et prestations</CardTitle>
                <CardDescription>Modifiez les lignes de votre proforma</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  append({
                    designation: "",
                    unite: "UN",
                    quantite: 1,
                    prixUnitaire: 0,
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">N°</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Désignation
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">
                      Unité
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-24">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">
                      Prix unitaire
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 w-32">
                      Total
                    </th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fields.map((field, index) => {
                    const quantite = lignes[index]?.quantite || 0;
                    const prixUnitaire = lignes[index]?.prixUnitaire || 0;
                    const total = quantite * prixUnitaire;

                    return (
                      <tr key={field.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            {...register(`lignes.${index}.designation`)}
                            placeholder="Description de l'article"
                            className="border-0 focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            {...register(`lignes.${index}.unite`)}
                            placeholder="UN"
                            className="border-0 focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="1"
                            {...register(`lignes.${index}.quantite`, {
                              valueAsNumber: true,
                            })}
                            className="border-0 focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`lignes.${index}.prixUnitaire`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0"
                            className="border-0 focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {total.toLocaleString("fr-FR")} GNF
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="border-t bg-gray-50 px-4 py-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">{total.toLocaleString("fr-FR")} GNF</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Remise</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                    {...register("remisePourcentage", {
                      valueAsNumber: true,
                    })}
                    className="w-20 h-7 text-xs"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-medium">{remiseMontant.toLocaleString("fr-FR")} GNF</span>
              </div>

              <div className="flex justify-between items-center text-base font-bold pt-2 border-t">
                <span>Total Net</span>
                <span>{totalNet.toLocaleString("fr-FR")} GNF</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/proformas/${id}`)}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>Enregistrer les modifications</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
