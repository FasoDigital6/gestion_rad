"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import SimpleSelect, {
  Option,
  SimpleSelectWithAddButton,
} from "@/components/react-select/simple-select";
import {
  useCreateFactureFromBdls,
  useCreateFactureManuelle,
} from "@/lib/hooks/use-facture";
import { useClients } from "@/lib/hooks/use-clients";
import type { Facture } from "@/lib/types/facture";
import type { Bdl } from "@/lib/types/bdl";
import { Loader2, Plus, Trash2, FileText } from "lucide-react";
import { RiUserAddLine } from "react-icons/ri";
import { ClientFormSheet } from "@/components/clients/client-form-sheet";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { calculateFactureTotals } from "@/lib/utils/facture";

// Schéma de validation avec Zod
const factureFormSchema = z.object({
  mode: z.enum(["bdl", "manual"]),

  // Mode BDL
  bdlIds: z.array(z.string()).optional(),

  // Mode Manuel
  clientId: z.string().optional(),

  // Champs communs
  dateEmission: z.date({
    message: "Veuillez indiquer la date d'émission",
  }),
  dateEcheance: z.date().optional(),
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
  conditionsPaiement: z.string().optional(),
  notes: z.string().optional(),
  lieu: z.string().optional(),
  fournisseur: z.string().optional(),
}).refine(
  (data) => {
    if (data.mode === "bdl") {
      return data.bdlIds && data.bdlIds.length > 0;
    } else {
      return data.clientId && data.clientId.length > 0;
    }
  },
  {
    message: "Client ou BDL requis selon le mode",
    path: ["clientId"],
  }
);

type FactureFormValues = z.infer<typeof factureFormSchema>;

interface FactureFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "bdl" | "manual";
  selectedBdls?: Bdl[];
  facture?: Facture | null;
}

export function FactureFormSheet({
  open,
  onOpenChange,
  mode,
  selectedBdls = [],
  facture,
}: FactureFormSheetProps) {
  const isEditing = !!facture;
  const createFromBdlsMutation = useCreateFactureFromBdls();
  const createManualMutation = useCreateFactureManuelle();
  const { data: clients } = useClients();
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    control,
    setValue,
  } = useForm<FactureFormValues>({
    resolver: zodResolver(factureFormSchema),
    defaultValues: {
      mode: mode,
      clientId: "",
      dateEmission: new Date(),
      dateEcheance: undefined,
      lignes: [
        {
          designation: "",
          unite: "Unité",
          quantite: 1,
          prixUnitaire: 0,
        },
      ],
      remisePourcentage: 0,
      conditionsPaiement: "",
      notes: "",
      lieu: "Siguiri",
      fournisseur: "Mr Balla TRAORE",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const lignes = watch("lignes");
  const remisePourcentage = watch("remisePourcentage") || 0;
  const clientId = watch("clientId");

  // Convertir les clients en options pour SimpleSelect
  const clientOptions: Option[] =
    clients?.map((client) => ({
      label: client.nom,
      value: client.id,
    })) || [];

  // Calcul des totaux
  const lignesWithTotal = lignes.map((l) => ({
    ...l,
    numero: 1,
    prixTotal: (l.quantite || 0) * (l.prixUnitaire || 0),
  }));

  const { total, remiseMontant, totalNet } = calculateFactureTotals(
    lignesWithTotal,
    remisePourcentage,
    0
  );

  // Récupérer le nom du client sélectionné
  const clientNom = useMemo(() => {
    if (mode === "bdl" && selectedBdls.length > 0) {
      return selectedBdls[0].clientNom;
    }
    return clients?.find((c) => c.id === clientId)?.nom || "";
  }, [mode, selectedBdls, clientId, clients]);

  // Agréger les lignes des BDL sélectionnés
  const aggregateBdlLines = (bdls: Bdl[]) => {
    const map = new Map<string, { designation: string; unite: string; quantite: number; prixUnitaire: number }>();

    bdls.forEach((bdl) => {
      bdl.lignes.forEach((ligne) => {
        const key = `${ligne.designation}-${ligne.unite}-${ligne.prixUnitaire}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.quantite += ligne.quantiteLivree;
        } else {
          map.set(key, {
            designation: ligne.designation,
            unite: ligne.unite,
            quantite: ligne.quantiteLivree,
            prixUnitaire: ligne.prixUnitaire,
          });
        }
      });
    });

    return Array.from(map.values());
  };

  // Charger les données en mode BDL
  useEffect(() => {
    if (!open) return; // Ne rien faire si le formulaire n'est pas ouvert

    if (mode === "bdl" && selectedBdls.length > 0) {
      const aggregatedLines = aggregateBdlLines(selectedBdls);

      reset({
        mode: "bdl",
        bdlIds: selectedBdls.map((b) => b.id),
        clientId: selectedBdls[0].clientId,
        dateEmission: new Date(),
        dateEcheance: undefined,
        lignes: aggregatedLines,
        remisePourcentage: selectedBdls[0].remisePourcentage || 0,
        conditionsPaiement: "",
        notes: "",
        lieu: selectedBdls[0].lieu || "Siguiri",
        fournisseur: selectedBdls[0].fournisseur || "Mr Balla TRAORE",
      });
    } else if (mode === "manual") {
      reset({
        mode: "manual",
        clientId: "",
        dateEmission: new Date(),
        dateEcheance: undefined,
        lignes: [
          {
            designation: "",
            unite: "Unité",
            quantite: 1,
            prixUnitaire: 0,
          },
        ],
        remisePourcentage: 0,
        conditionsPaiement: "",
        notes: "",
        lieu: "Siguiri",
        fournisseur: "Mr Balla TRAORE",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: FactureFormValues) => {
    try {
      if (data.mode === "bdl") {
        await createFromBdlsMutation.mutateAsync({
          bdlIds: data.bdlIds!,
          dateEmission: data.dateEmission,
          dateEcheance: data.dateEcheance,
          remisePourcentage: data.remisePourcentage,
          conditionsPaiement: data.conditionsPaiement,
          notes: data.notes,
          lieu: data.lieu,
          fournisseur: data.fournisseur,
        });
      } else {
        await createManualMutation.mutateAsync({
          clientId: data.clientId!,
          clientNom,
          dateEmission: data.dateEmission,
          dateEcheance: data.dateEcheance,
          lignes: data.lignes,
          remisePourcentage: data.remisePourcentage,
          conditionsPaiement: data.conditionsPaiement,
          notes: data.notes,
          lieu: data.lieu,
          fournisseur: data.fournisseur,
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la facture:", error);
      alert("Erreur lors de la création de la facture");
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={mode === "bdl" ? "Créer une facture depuis BDL" : "Nouvelle facture manuelle"}
      description={
        mode === "bdl"
          ? "Facture générée à partir des bons de livraison sélectionnés."
          : "Remplissez les informations ci-dessous pour créer une nouvelle facture."
      }
      size="sm:max-w-[1100px]"
      side="right"
      className="bg-background"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden bg-background"
      >
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="space-y-10 max-w-5xl mx-auto">
            {/* Section Informations générales */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Informations générales
              </h3>

              {/* Badges BDL si mode BDL */}
              {mode === "bdl" && selectedBdls.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Bons de livraison sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBdls.map((bdl) => (
                      <Badge
                        key={bdl.id}
                        variant="outline"
                        className="bg-white border-blue-300 text-blue-700"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {bdl.numero}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client */}
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <FieldLabel
                          htmlFor="clientId"
                          className="text-foreground font-medium"
                        >
                          Client
                        </FieldLabel>
                        {mode === "bdl" ? (
                          <Input
                            value={clientNom}
                            readOnly
                            disabled
                            className="h-11 bg-gray-100"
                          />
                        ) : (
                          <SimpleSelectWithAddButton
                            field={{
                              ...field,
                              value:
                                clientOptions.find(
                                  (opt) => opt.value === field.value
                                ) || null,
                              onChange: (selected) =>
                                field.onChange(
                                  selected ? (selected as Option).value : ""
                                ),
                            }}
                            placeholder="Sélectionner un client"
                            options={clientOptions}
                            addButtonIcon={
                              <RiUserAddLine className="mr-2 h-4 w-4" />
                            }
                            addButtonLabel="Nouveau client"
                            onAddButtonClick={() => {
                              setIsClientFormOpen(true);
                            }}
                            className="h-11"
                          />
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Date d'émission */}
                  <Controller
                    name="dateEmission"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <FieldLabel
                          htmlFor="dateEmission"
                          className="text-foreground font-medium"
                        >
                          Date d'émission
                        </FieldLabel>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Sélectionner une date"
                          className="h-11 w-full"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date d'échéance */}
                  <Controller
                    name="dateEcheance"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <FieldLabel
                          htmlFor="dateEcheance"
                          className="text-foreground font-medium"
                        >
                          Date d'échéance (optionnel)
                        </FieldLabel>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Sélectionner une date"
                          className="h-11 w-full"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Conditions de paiement */}
                  <Controller
                    name="conditionsPaiement"
                    control={control}
                    render={({ field }) => (
                      <Field className="space-y-2">
                        <FieldLabel
                          htmlFor="conditionsPaiement"
                          className="text-foreground font-medium"
                        >
                          Conditions de paiement (optionnel)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="conditionsPaiement"
                          placeholder="Ex: Paiement à 30 jours"
                          className="h-11 bg-background transition-colors"
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-section-divider" />

            {/* Section Articles et prestations */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Articles facturés
              </h3>

              <div className="border border-table-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-table-header border-b border-table-border">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Désignation
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                          Unité
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">
                          Qté
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-40">
                          P.U (GNF)
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-40">
                          Total
                        </th>
                        {mode === "manual" && <th className="px-4 py-4 w-12"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {fields.map((field, index) => {
                        const quantite = lignes[index]?.quantite || 0;
                        const prixUnitaire = lignes[index]?.prixUnitaire || 0;
                        const total = quantite * prixUnitaire;

                        return (
                          <tr
                            key={field.id}
                            className="group hover:bg-table-row-hover transition-colors"
                          >
                            <td className="px-6 py-3">
                              <Controller
                                name={`lignes.${index}.designation`}
                                control={control}
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <Input
                                      {...field}
                                      placeholder="Description de l'article"
                                      className="shadow-sm hover:bg-muted/30 focus:bg-background transition-all h-9"
                                      aria-invalid={fieldState.invalid}
                                      readOnly={mode === "bdl"}
                                    />
                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </Field>
                                )}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Controller
                                name={`lignes.${index}.unite`}
                                control={control}
                                render={({ field }) => (
                                  <Field>
                                    <Input
                                      {...field}
                                      placeholder="Unité"
                                      className="shadow-sm hover:bg-muted/30 focus:bg-background transition-all h-9"
                                      readOnly={mode === "bdl"}
                                    />
                                  </Field>
                                )}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Controller
                                name={`lignes.${index}.quantite`}
                                control={control}
                                render={({ field }) => (
                                  <Field>
                                    <Input
                                      {...field}
                                      type="number"
                                      min="1"
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        )
                                      }
                                      className="shadow-sm hover:bg-muted/30 focus:bg-background transition-all h-9"
                                      readOnly={mode === "bdl"}
                                    />
                                  </Field>
                                )}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Controller
                                name={`lignes.${index}.prixUnitaire`}
                                control={control}
                                render={({ field }) => (
                                  <Field>
                                    <Input
                                      {...field}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        )
                                      }
                                      placeholder="0"
                                      className="shadow-sm hover:bg-muted/30 focus:bg-background transition-all h-9"
                                      readOnly={mode === "bdl"}
                                    />
                                  </Field>
                                )}
                              />
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-foreground tabular-nums">
                              {total.toLocaleString("fr-FR")}
                            </td>
                            {mode === "manual" && (
                              <td className="px-4 py-3 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={() => remove(index)}
                                  disabled={fields.length === 1}
                                  title="Supprimer cette ligne"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {mode === "manual" && (
                  <div className="p-4 bg-table-header border-t border-table-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed hover:border-brand/80 hover:text-brand hover:bg-brand/10 h-10 gap-2 transition-all"
                      onClick={() =>
                        append({
                          designation: "",
                          unite: "Unité",
                          quantite: 1,
                          prixUnitaire: 0,
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une ligne
                    </Button>
                  </div>
                )}

                {/* Totaux */}
                <div className="bg-gradient-to-br from-table-header to-background p-6 space-y-4 border-t border-table-border">
                  <div className="flex flex-col gap-3 ml-auto max-w-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-helper-text font-medium">Sous-total HT</span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {total.toLocaleString("fr-FR")} GNF
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-helper-text font-medium text-sm">Remise</span>
                        <div className="relative w-24">
                          <Controller
                            name="remisePourcentage"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="h-8 text-sm pr-8 text-right bg-background border-border focus:border-brand"
                              />
                            )}
                          />
                          <span className="absolute right-2.5 top-2 text-xs text-helper-text pointer-events-none font-medium">
                            %
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-destructive tabular-nums min-w-[120px] text-right text-sm">
                        - {remiseMontant.toLocaleString("fr-FR")} GNF
                      </span>
                    </div>

                    <div className="h-px bg-border my-2" />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-foreground">
                        Total Net à payer
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand tabular-nums">
                          {totalNet.toLocaleString("fr-FR")}
                        </div>
                        <div className="text-sm font-normal text-helper-text">
                          Francs guinéens
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-section-divider" />

            {/* Notes */}
            <div className="space-y-4">
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Field className="space-y-2">
                    <FieldLabel
                      htmlFor="notes"
                      className="text-foreground font-medium"
                    >
                      Notes internes (optionnel)
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="notes"
                      placeholder="Ajoutez des notes ou commentaires..."
                      rows={3}
                      className="bg-background"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="py-5 px-6 border-t border-border bg-background gap-3 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-11 px-6 min-w-[120px]"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-8 bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Créer la facture (brouillon)"
            )}
          </Button>
        </SheetFooter>
      </form>

      <ClientFormSheet
        open={isClientFormOpen}
        onOpenChange={setIsClientFormOpen}
        client={null}
        onClientCreated={(clientId) => {
          setValue("clientId", clientId);
        }}
      />
    </Slider>
  );
}
