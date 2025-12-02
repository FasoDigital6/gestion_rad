"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { SheetFooter } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useCreateDepense, useUpdateDepense } from "@/lib/hooks/use-depense";
import { useBdcs } from "@/lib/hooks/use-bdc";
import type { Depense } from "@/lib/types/depense";
import { CATEGORIE_DEPENSE_LABELS } from "@/lib/types/depense";
import {
  createDepenseSchema,
  type CreateDepenseFormValues,
} from "@/lib/schemas/depense-schema";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface DepenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depense?: Depense | null;
  userId?: string;
  userName?: string;
}

export function DepenseFormSheet({
  open,
  onOpenChange,
  depense,
  userId,
  userName,
}: DepenseFormSheetProps) {
  const isEditing = !!depense;
  const createMutation = useCreateDepense();
  const updateMutation = useUpdateDepense();
  const { data: bdcs } = useBdcs();

  const form = useForm<CreateDepenseFormValues>({
    resolver: zodResolver(createDepenseSchema),
    defaultValues: {
      montant: 0,
      categorie: "AUTRE",
      description: "",
      dateDepense: new Date(),
      bdcId: "",
      bdcNumero: "",
      notes: "",
      fichierUrl: "",
      fichierNom: "",
      fichierType: "",
    },
  });

  // Réinitialiser le formulaire quand une dépense est sélectionnée
  useEffect(() => {
    if (depense && open) {
      form.reset({
        montant: depense.montant,
        categorie: depense.categorie,
        description: depense.description,
        dateDepense: depense.dateDepense,
        bdcId: depense.bdcId || "",
        bdcNumero: depense.bdcNumero || "",
        notes: depense.notes || "",
        fichierUrl: depense.fichierUrl || "",
        fichierNom: depense.fichierNom || "",
        fichierType: depense.fichierType || "",
      });
    } else if (!depense && open) {
      form.reset({
        montant: 0,
        categorie: "AUTRE",
        description: "",
        dateDepense: new Date(),
        bdcId: "",
        bdcNumero: "",
        notes: "",
        fichierUrl: "",
        fichierNom: "",
        fichierType: "",
      });
    }
  }, [depense, open, form]);

  const onSubmit = async (data: CreateDepenseFormValues) => {
    try {
      if (isEditing && depense) {
        await updateMutation.mutateAsync({
          id: depense.id,
          ...data,
        });
        toast.success("Dépense modifiée avec succès");
      } else {
        await createMutation.mutateAsync({
          data,
          userId,
          userName,
        });
        toast.success("Dépense créée avec succès");
      }
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Options BDC pour le select
  const bdcOptions =
    bdcs?.map((bdc) => ({
      value: bdc.id,
      label: `${bdc.numero} - ${bdc.clientNom}`,
      numero: bdc.numero,
    })) || [];

  // Gérer la sélection du BDC
  const handleBdcChange = (bdcId: string) => {
    const selectedBdc = bdcs?.find((b) => b.id === bdcId);
    if (selectedBdc) {
      form.setValue("bdcId", bdcId);
      form.setValue("bdcNumero", selectedBdc.numero);
    } else {
      form.setValue("bdcId", "");
      form.setValue("bdcNumero", "");
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? "Modifier la dépense" : "Ajouter une dépense"}
      description={
        isEditing
          ? "Modifiez les informations de la dépense"
          : "Enregistrez une nouvelle dépense"
      }
      size="sm:max-w-[600px]"
      side="right"
      className="bg-background"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden bg-background"
      >
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="space-y-6">
            {/* Montant */}
            <Field>
              <FieldLabel required>Montant (GNF)</FieldLabel>
              <Controller
                control={form.control}
                name="montant"
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isLoading}
                  />
                )}
              />
              <FieldError>{form.formState.errors.montant?.message}</FieldError>
            </Field>

            {/* Catégorie */}
            <Field>
              <FieldLabel required>Catégorie</FieldLabel>
              <Controller
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIE_DEPENSE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.categorie?.message}
              </FieldError>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel required>Description</FieldLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    placeholder="Description de la dépense..."
                    {...field}
                    disabled={isLoading}
                    rows={3}
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>

            {/* Date de la dépense */}
            <Field>
              <FieldLabel required>Date de la dépense</FieldLabel>
              <Controller
                control={form.control}
                name="dateDepense"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    onDateChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.dateDepense?.message}
              </FieldError>
            </Field>

            {/* Lier à un BDC (optionnel) */}
            <Field>
              <FieldLabel>Lier à un bon de commande (optionnel)</FieldLabel>
              <Controller
                control={form.control}
                name="bdcId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => handleBdcChange(value || "")}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun BDC sélectionné" />
                    </SelectTrigger>
                    <SelectContent>
                      {bdcOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.bdcId?.message}</FieldError>
            </Field>

            {/* Fichier justificatif (placeholder) */}
            <Field>
              <FieldLabel>Fichier justificatif (à venir)</FieldLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={true}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Joindre un fichier (bientôt disponible)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés : PDF, JPG, PNG (max 5 MB)
              </p>
            </Field>

            {/* Notes */}
            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    placeholder="Notes additionnelles..."
                    {...field}
                    value={field.value || ""}
                    disabled={isLoading}
                    rows={3}
                  />
                )}
              />
            </Field>
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-brand hover:bg-brand/90">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Modifier" : "Ajouter"}
          </Button>
        </SheetFooter>
      </form>
    </Slider>
  );
}
