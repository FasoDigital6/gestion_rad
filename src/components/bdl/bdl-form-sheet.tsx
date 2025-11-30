"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { useCreateBdlFromBdc } from "@/lib/hooks/use-bdl";
import { useBdcDeliveryProgress } from "@/lib/hooks/use-bdl";
import { Loader2, AlertCircle } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Bdc } from "@/lib/types/bdc";
import { BdcLigneProgress } from "@/lib/types/bdl";

// Schéma de validation avec Zod
const bdlFormSchema = z.object({
  dateLivraison: z.date({
    message: "Veuillez indiquer la date de livraison",
  }),
  heureLivraison: z.string().optional(),
  nomLivreur: z.string().optional(),
  observations: z.string().optional(),
  signatureReception: z.string().optional(),
  lignes: z
    .array(
      z.object({
        ligneNumero: z.number(),
        quantiteLivree: z.number().min(0, "La quantité doit être positive"),
      })
    )
    .min(1, "Au moins une ligne est requise"),
  notes: z.string().optional(),
});

type BdlFormValues = z.infer<typeof bdlFormSchema>;

interface BdlFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bdc: Bdc;
}

export function BdlFormSheet({ open, onOpenChange, bdc }: BdlFormSheetProps) {
  const router = useRouter();
  const createMutation = useCreateBdlFromBdc();
  const { data: progress } = useBdcDeliveryProgress(bdc.id);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    control,
  } = useForm<BdlFormValues>({
    resolver: zodResolver(bdlFormSchema),
    defaultValues: {
      dateLivraison: new Date(),
      heureLivraison: "",
      nomLivreur: "",
      observations: "",
      signatureReception: "",
      lignes: [],
      notes: "",
    },
  });

  const lignes = watch("lignes");

  // Initialiser les lignes avec les quantités restantes
  useEffect(() => {
    if (progress && open) {
      const initialLignes = progress.lignesProgress
        .filter((lp) => lp.quantiteRestante > 0)
        .map((lp) => ({
          ligneNumero: lp.ligneNumero,
          quantiteLivree: lp.quantiteRestante, // Par défaut, livrer toute la quantité restante
        }));

      reset({
        dateLivraison: new Date(),
        heureLivraison: "",
        nomLivreur: "",
        observations: "",
        signatureReception: "",
        lignes: initialLignes,
        notes: "",
      });
      setValidationErrors([]);
    }
  }, [progress, open, reset]);

  // Validation en temps réel
  useEffect(() => {
    if (!progress) return;

    const errors: string[] = [];

    lignes.forEach((ligne) => {
      const ligneProgress = progress.lignesProgress.find(
        (lp) => lp.ligneNumero === ligne.ligneNumero
      );

      if (!ligneProgress) return;

      if (ligne.quantiteLivree > ligneProgress.quantiteRestante) {
        errors.push(
          `${ligneProgress.designation}: Quantité livrée (${ligne.quantiteLivree}) dépasse la quantité restante (${ligneProgress.quantiteRestante})`
        );
      }

      if (ligne.quantiteLivree <= 0) {
        errors.push(
          `${ligneProgress.designation}: Quantité livrée doit être supérieure à 0`
        );
      }
    });

    setValidationErrors(errors);
  }, [lignes, progress]);

  // Calculer les totaux
  const calculateTotals = () => {
    if (!progress) return { total: 0, remiseMontant: 0, totalNet: 0 };

    const total = lignes.reduce((sum, ligne) => {
      const bdcLigne = bdc.lignes.find((l) => l.numero === ligne.ligneNumero);
      if (!bdcLigne) return sum;
      return sum + ligne.quantiteLivree * bdcLigne.prixUnitaire;
    }, 0);

    const remiseMontant = (total * bdc.remisePourcentage) / 100;
    const totalNet = total - remiseMontant;

    return { total, remiseMontant, totalNet };
  };

  const { total, remiseMontant, totalNet } = calculateTotals();

  const onSubmit = async (data: BdlFormValues) => {
    if (validationErrors.length > 0) {
      return;
    }

    try {
      const bdlId = await createMutation.mutateAsync({
        bdcId: bdc.id,
        deliveryData: {
          dateLivraison: data.dateLivraison,
          heureLivraison: data.heureLivraison,
          nomLivreur: data.nomLivreur,
          observations: data.observations,
          signatureReception: data.signatureReception,
          lignes: data.lignes,
          notes: data.notes,
        },
      });

      onOpenChange(false);
      reset();
      router.push(`/bdl/${bdlId}`);
    } catch (error: unknown) {
      console.error("Erreur lors de la création du BDL:", error);
      if (error instanceof Error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert("Erreur lors de la création du BDL");
      }
    }
  };

  if (!progress) {
    return null;
  }

  const lignesDisponibles = progress.lignesProgress.filter(
    (lp) => lp.quantiteRestante > 0
  );

  if (lignesDisponibles.length === 0) {
    return (
      <Slider
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Nouveau Bon de Livraison"
        description="Toutes les quantités ont déjà été livrées."
        size="sm:max-w-[600px]"
        side="right"
      >
        <div className="p-6 text-center">
          <p className="text-muted-foreground">
            Toutes les quantités commandées ont été livrées. Impossible de
            créer un nouveau bon de livraison.
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="mt-4"
            variant="outline"
          >
            Fermer
          </Button>
        </div>
      </Slider>
    );
  }

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Nouveau Bon de Livraison"
      description={`Créer un bon de livraison pour le BDC ${bdc.numero}`}
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
            {/* Section Informations de livraison */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Informations de livraison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date de livraison */}
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
                        Date de livraison *
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

                {/* Heure de livraison */}
                <Controller
                  name="heureLivraison"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel
                        htmlFor="heureLivraison"
                        className="text-foreground font-medium"
                      >
                        Heure de livraison
                      </FieldLabel>
                      <Input
                        {...field}
                        id="heureLivraison"
                        type="text"
                        placeholder="Ex: 14:30"
                        className="h-11 bg-background transition-colors"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Nom du livreur */}
                <Controller
                  name="nomLivreur"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel
                        htmlFor="nomLivreur"
                        className="text-foreground font-medium"
                      >
                        Nom du livreur / transporteur
                      </FieldLabel>
                      <Input
                        {...field}
                        id="nomLivreur"
                        type="text"
                        placeholder="Ex: Jean Dupont"
                        className="h-11 bg-background transition-colors"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Observations */}
                <Controller
                  name="observations"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel
                        htmlFor="observations"
                        className="text-foreground font-medium"
                      >
                        Observations de livraison
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="observations"
                        placeholder="Notes concernant la livraison..."
                        rows={3}
                        className="resize-none bg-background transition-colors"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Signature / Preuve de réception */}
                <Controller
                  name="signatureReception"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-2"
                    >
                      <FieldLabel
                        htmlFor="signatureReception"
                        className="text-foreground font-medium"
                      >
                        Signature / Preuve de réception
                      </FieldLabel>
                      <Input
                        {...field}
                        id="signatureReception"
                        type="text"
                        placeholder="Nom du signataire ou référence"
                        className="h-11 bg-background transition-colors"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="h-px bg-section-divider" />

            {/* Section Articles à livrer */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Articles à livrer
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajustez les quantités à livrer pour chaque article
                </p>
              </div>

              {/* Erreurs de validation */}
              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive mb-2">
                        Erreurs de validation
                      </p>
                      <ul className="text-sm text-destructive space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-table-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-table-header border-b border-table-border">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Désignation
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-24">
                          Unité
                        </th>
                        <th className="px-4 py-4 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                          Qté cmd
                        </th>
                        <th className="px-4 py-4 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                          Restant
                        </th>
                        <th className="px-4 py-4 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-40">
                          Qté à livrer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {progress.lignesProgress.map(
                        (ligneProgress: BdcLigneProgress) => {
                          if (ligneProgress.quantiteRestante === 0) return null;

                          const ligneIndex = lignes.findIndex(
                            (l) => l.ligneNumero === ligneProgress.ligneNumero
                          );

                          return (
                            <tr
                              key={ligneProgress.ligneNumero}
                              className="hover:bg-table-row-hover transition-colors"
                            >
                              <td className="px-6 py-3">
                                <p className="font-medium">
                                  {ligneProgress.designation}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {ligneProgress.unite}
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">
                                {ligneProgress.quantiteCommandee}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Badge
                                  className={
                                    ligneProgress.quantiteRestante > 0
                                      ? "bg-success/10 text-success"
                                      : "bg-muted text-muted-foreground"
                                  }
                                >
                                  {ligneProgress.quantiteRestante}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Controller
                                  name={`lignes.${ligneIndex}.quantiteLivree`}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      min="0"
                                      max={ligneProgress.quantiteRestante}
                                      step="1"
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className={`h-9 text-right ${
                                        field.value >
                                        ligneProgress.quantiteRestante
                                          ? "border-destructive focus:border-destructive"
                                          : ""
                                      }`}
                                    />
                                  )}
                                />
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="bg-gradient-to-br from-table-header to-background p-6 space-y-4 border-t border-table-border">
                  <div className="flex flex-col gap-3 ml-auto max-w-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-helper-text font-medium">
                        Sous-total HT
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {total.toLocaleString("fr-FR")} GNF
                      </span>
                    </div>

                    {bdc.remisePourcentage > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-helper-text font-medium">
                          Remise ({bdc.remisePourcentage}%)
                        </span>
                        <span className="font-semibold text-destructive tabular-nums">
                          - {remiseMontant.toLocaleString("fr-FR")} GNF
                        </span>
                      </div>
                    )}

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

            <div className="h-px bg-section-divider" />

            {/* Section Notes internes */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Notes internes
              </h3>

              <Controller
                name="notes"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-2">
                    <Textarea
                      {...field}
                      id="notes"
                      placeholder="Notes internes (non visibles sur le document PDF)"
                      rows={3}
                      className="resize-none bg-background transition-colors"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
            disabled={isSubmitting || validationErrors.length > 0}
            className="h-11 px-8 bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le BDL"
            )}
          </Button>
        </SheetFooter>
      </form>
    </Slider>
  );
}
