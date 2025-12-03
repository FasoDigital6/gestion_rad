"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import SimpleSelect, {
  Option,
  SimpleSelectWithAddButton,
} from "@/components/react-select/simple-select";
import {
  useCreateProforma,
  useUpdateProforma,
} from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Proforma } from "@/lib/types/proforma";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RiUserAddLine } from "react-icons/ri";
import { ClientFormSheet } from "@/components/clients/client-form-sheet";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

// Schéma de validation avec Zod
const proformaFormSchema = z.object({
  clientId: z.string({
    message: "Veuillez sélectionner un client",
  }),
  date: z.date({
    message: "Veuillez indiquer la date",
  }),
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

interface ProformaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proforma?: Proforma | null;
  onProformaCreated?: (proformaId: string) => void;
}

export function ProformaFormSheet({
  open,
  onOpenChange,
  proforma,
  onProformaCreated,
}: ProformaFormSheetProps) {
  const isEditing = !!proforma;
  const createMutation = useCreateProforma();
  const updateMutation = useUpdateProforma();
  const { data: clients } = useClients();
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    control,
    setValue,
  } = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      clientId: "",
      date: new Date(),
      dateLivraison: "",
      lignes: [
        {
          designation: "",
          unite: "Unité",
          quantite: 1,
          prixUnitaire: 0,
        },
      ],
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

  // Convertir les clients en options pour SimpleSelect
  const clientOptions: Option[] =
    clients?.map((client) => ({
      label: client.nom,
      value: client.id,
    })) || [];

  // Calcul des totaux
  const total = lignes.reduce(
    (sum, ligne) => sum + (ligne.quantite || 0) * (ligne.prixUnitaire || 0),
    0
  );
  const remiseMontant = (total * remisePourcentage) / 100;
  const totalNet = total - remiseMontant;

  // Récupérer le nom du client sélectionné
  const clientNom = clients?.find((c) => c.id === clientId)?.nom || "";

  // Charger les données du proforma en mode édition
  useEffect(() => {
    if (proforma) {
      reset({
        clientId: proforma.clientId,
        date: proforma.dateCreation,
        dateLivraison: proforma.dateLivraison,
        lignes: proforma.lignes,
        remisePourcentage: proforma.remisePourcentage,
      });
    } else {
      reset({
        clientId: "",
        date: new Date(),
        dateLivraison: "",
        lignes: [
          {
            designation: "",
            unite: "Unité",
            quantite: 1,
            prixUnitaire: 0,
          },
        ],
        remisePourcentage: 0,
      });
    }
  }, [proforma, reset]);

  const onSubmit = async (data: ProformaFormValues) => {
    try {
      // Note: data.date is available here but might not be used by the backend yet
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: proforma.id,
          ...data,
          clientNom,
        });
      } else {
        const proformaId = await createMutation.mutateAsync({
          ...data,
          clientNom,
        });
        if (onProformaCreated && proformaId) {
          onProformaCreated(proformaId);
        }
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du proforma:", error);
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? "Modifier le proforma" : "Nouveau proforma"}
      description={
        isEditing
          ? "Modifiez les informations ci-dessous pour mettre à jour le devis."
          : "Remplissez les informations ci-dessous pour créer un nouveau devis."
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
            {/* Section Informations client */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Informations générales
              </h3>

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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Date */}
                  <Controller
                    name="date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <FieldLabel
                          htmlFor="date"
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
                  {/* Date de livraison (Validité en jours) */}
                  <Controller
                    name="dateLivraison"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <FieldLabel
                          htmlFor="dateLivraison"
                          className="text-foreground font-medium"
                        >
                          Validité de l'offre
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="dateLivraison"
                            type="number"
                            placeholder="30"
                            aria-invalid={fieldState.invalid}
                            className="h-11 bg-background transition-colors pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-helper-text text-sm">
                            jours
                          </div>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                Détails de la commande
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
                        <th className="px-4 py-4 w-12"></th>
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
                                    />
                                  </Field>
                                )}
                              />
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-foreground tabular-nums">
                              {total.toLocaleString("fr-FR")}
                            </td>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

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
                                  field.onChange(parseFloat(e.target.value))
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
                        Total TTC
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
              "Enregistrer le proforma"
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
