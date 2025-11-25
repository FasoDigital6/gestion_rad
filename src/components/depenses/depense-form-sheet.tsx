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
import { useCreateDepense, useUpdateDepense } from "@/lib/hooks/use-depenses";
import { Depense, CategorieDepense } from "@/lib/types/depense";
import { Loader2 } from "lucide-react";

// Schéma de validation avec Zod
const depenseFormSchema = z.object({
  designation: z.string().min(3, "La désignation doit contenir au moins 3 caractères"),
  categorie: z.enum([
    "fournitures",
    "transport",
    "salaires",
    "loyer",
    "electricite",
    "eau",
    "internet",
    "telephonie",
    "maintenance",
    "formation",
    "autre",
  ]),
  montant: z.coerce.number().positive("Le montant doit être positif"),
  dateDepense: z.string().min(1, "La date de dépense est requise"),
  fournisseur: z.string().optional(),
  numeroFactureFournisseur: z.string().optional(),
  notes: z.string().optional(),
  modePaiement: z.enum(["especes", "cheque", "virement", "carte", "mobile_money"]).optional(),
  datePaiement: z.string().optional(),
});

type DepenseFormValues = z.infer<typeof depenseFormSchema>;

interface DepenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depense?: Depense | null;
  userId: string;
}

const categorieLabels: Record<CategorieDepense, string> = {
  fournitures: "Fournitures",
  transport: "Transport",
  salaires: "Salaires",
  loyer: "Loyer",
  electricite: "Électricité",
  eau: "Eau",
  internet: "Internet",
  telephonie: "Téléphonie",
  maintenance: "Maintenance",
  formation: "Formation",
  autre: "Autre",
};

export function DepenseFormSheet({
  open,
  onOpenChange,
  depense,
  userId,
}: DepenseFormSheetProps) {
  const isEditing = !!depense;
  const createMutation = useCreateDepense();
  const updateMutation = useUpdateDepense();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<DepenseFormValues>({
    resolver: zodResolver(depenseFormSchema),
    defaultValues: {
      designation: "",
      categorie: "fournitures",
      montant: 0,
      dateDepense: new Date().toISOString().split("T")[0],
      fournisseur: "",
      numeroFactureFournisseur: "",
      notes: "",
      modePaiement: undefined,
      datePaiement: "",
    },
  });

  const categorie = watch("categorie");
  const modePaiement = watch("modePaiement");

  // Charger les données de la dépense en mode édition
  useEffect(() => {
    if (depense) {
      reset({
        designation: depense.designation,
        categorie: depense.categorie,
        montant: depense.montant,
        dateDepense: depense.dateDepense.toISOString().split("T")[0],
        fournisseur: depense.fournisseur || "",
        numeroFactureFournisseur: depense.numeroFactureFournisseur || "",
        notes: depense.notes || "",
        modePaiement: depense.modePaiement,
        datePaiement: depense.datePaiement?.toISOString().split("T")[0] || "",
      });
    } else {
      reset({
        designation: "",
        categorie: "fournitures",
        montant: 0,
        dateDepense: new Date().toISOString().split("T")[0],
        fournisseur: "",
        numeroFactureFournisseur: "",
        notes: "",
        modePaiement: undefined,
        datePaiement: "",
      });
    }
  }, [depense, reset]);

  const onSubmit = async (data: DepenseFormValues) => {
    try {
      const depenseData = {
        designation: data.designation,
        categorie: data.categorie,
        montant: data.montant,
        dateDepense: new Date(data.dateDepense),
        fournisseur: data.fournisseur,
        numeroFactureFournisseur: data.numeroFactureFournisseur,
        notes: data.notes,
        modePaiement: data.modePaiement,
        datePaiement: data.datePaiement ? new Date(data.datePaiement) : undefined,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: depense.id,
          ...depenseData,
        });
      } else {
        await createMutation.mutateAsync({
          data: depenseData,
          userId,
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la dépense:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier la dépense" : "Nouvelle dépense"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations de la dépense ci-dessous."
                : "Remplissez les informations de la nouvelle dépense."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Désignation */}
            <div className="grid gap-3">
              <Label htmlFor="designation">
                Désignation <span className="text-red-600">*</span>
              </Label>
              <Input
                id="designation"
                placeholder="Ex: Achat de fournitures de bureau"
                {...register("designation")}
              />
              {errors.designation && (
                <p className="text-sm text-red-600">{errors.designation.message}</p>
              )}
            </div>

            {/* Catégorie */}
            <div className="grid gap-3">
              <Label htmlFor="categorie">
                Catégorie <span className="text-red-600">*</span>
              </Label>
              <Select
                value={categorie}
                onValueChange={(value) =>
                  setValue("categorie", value as CategorieDepense)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categorieLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie && (
                <p className="text-sm text-red-600">{errors.categorie.message}</p>
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

            {/* Date de dépense */}
            <div className="grid gap-3">
              <Label htmlFor="dateDepense">
                Date de dépense <span className="text-red-600">*</span>
              </Label>
              <Input
                id="dateDepense"
                type="date"
                {...register("dateDepense")}
              />
              {errors.dateDepense && (
                <p className="text-sm text-red-600">{errors.dateDepense.message}</p>
              )}
            </div>

            {/* Fournisseur */}
            <div className="grid gap-3">
              <Label htmlFor="fournisseur">Fournisseur (Optionnel)</Label>
              <Input
                id="fournisseur"
                placeholder="Ex: SONABEL"
                {...register("fournisseur")}
              />
            </div>

            {/* Numéro facture fournisseur */}
            <div className="grid gap-3">
              <Label htmlFor="numeroFactureFournisseur">
                N° Facture fournisseur (Optionnel)
              </Label>
              <Input
                id="numeroFactureFournisseur"
                placeholder="Ex: FAC-2024-001"
                {...register("numeroFactureFournisseur")}
              />
            </div>

            {/* Mode de paiement */}
            <div className="grid gap-3">
              <Label htmlFor="modePaiement">Mode de paiement (Optionnel)</Label>
              <Select
                value={modePaiement || ""}
                onValueChange={(value) =>
                  setValue("modePaiement", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="carte">Carte bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de paiement - Si mode de paiement sélectionné */}
            {modePaiement && (
              <div className="grid gap-3">
                <Label htmlFor="datePaiement">Date de paiement</Label>
                <Input
                  id="datePaiement"
                  type="date"
                  {...register("datePaiement")}
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
                "Créer la dépense"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
