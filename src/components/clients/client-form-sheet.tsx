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
import { useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { Client } from "@/lib/types/client";
import { Loader2 } from "lucide-react";

// Schéma de validation avec Zod
const clientFormSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Le téléphone doit contenir au moins 8 chiffres"),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  ifu: z.string().optional(),
  rccm: z.string().optional(),
  statut: z.enum(["actif", "inactif"]),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormSheet({
  open,
  onOpenChange,
  client,
}: ClientFormSheetProps) {
  const isEditing = !!client;
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      ifu: "",
      rccm: "",
      statut: "actif",
    },
  });

  const statut = watch("statut");

  // Charger les données du client en mode édition
  useEffect(() => {
    if (client) {
      reset({
        nom: client.nom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse,
        ifu: client.ifu || "",
        rccm: client.rccm || "",
        statut: client.statut,
      });
    } else {
      reset({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        ifu: "",
        rccm: "",
        statut: "actif",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: client.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Modifier le client" : "Nouveau client"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Modifiez les informations du client ci-dessous."
                : "Remplissez les informations du nouveau client."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-6 py-6">
            {/* Nom */}
            <div className="grid gap-3">
              <Label htmlFor="nom">
                Nom du client <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nom"
                placeholder="Ex: SAG Burkina"
                {...register("nom")}
              />
              {errors.nom && (
                <p className="text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-3">
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@exemple.bf"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="grid gap-3">
              <Label htmlFor="telephone">
                Téléphone <span className="text-red-600">*</span>
              </Label>
              <Input
                id="telephone"
                placeholder="+226 25 30 30 30"
                {...register("telephone")}
              />
              {errors.telephone && (
                <p className="text-sm text-red-600">
                  {errors.telephone.message}
                </p>
              )}
            </div>

            {/* Adresse */}
            <div className="grid gap-3">
              <Label htmlFor="adresse">
                Adresse <span className="text-red-600">*</span>
              </Label>
              <Input
                id="adresse"
                placeholder="Ouagadougou, Burkina Faso"
                {...register("adresse")}
              />
              {errors.adresse && (
                <p className="text-sm text-red-600">{errors.adresse.message}</p>
              )}
            </div>

            {/* IFU */}
            <div className="grid gap-3">
              <Label htmlFor="ifu">IFU (Optionnel)</Label>
              <Input
                id="ifu"
                placeholder="00012345A"
                {...register("ifu")}
              />
              {errors.ifu && (
                <p className="text-sm text-red-600">{errors.ifu.message}</p>
              )}
            </div>

            {/* RCCM */}
            <div className="grid gap-3">
              <Label htmlFor="rccm">RCCM (Optionnel)</Label>
              <Input
                id="rccm"
                placeholder="BF-OUA-01-2020-B12-00001"
                {...register("rccm")}
              />
              {errors.rccm && (
                <p className="text-sm text-red-600">{errors.rccm.message}</p>
              )}
            </div>

            {/* Statut */}
            <div className="grid gap-3">
              <Label htmlFor="statut">
                Statut <span className="text-red-600">*</span>
              </Label>
              <Select
                value={statut}
                onValueChange={(value) =>
                  setValue("statut", value as "actif" | "inactif")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
              {errors.statut && (
                <p className="text-sm text-red-600">{errors.statut.message}</p>
              )}
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
                "Créer le client"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
