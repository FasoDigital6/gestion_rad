"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

import { useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { Client } from "@/lib/types/client";
import { Loader2 } from "lucide-react";

const clientFormSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  telephone: z
    .string()
    .min(8, "Le téléphone doit contenir au moins 8 chiffres"),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  rccm: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onClientCreated?: (clientId: string) => void;
}

export function ClientFormSheet({
  open,
  onOpenChange,
  client,
  onClientCreated,
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
      rccm: "",
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        nom: client.nom,
        email: client.email,
        telephone: client.telephone,
        adresse: client.adresse,
        rccm: client.rccm || "",
      });
    } else {
      reset({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        rccm: "",
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: client!.id,
          ...data,
        });
      } else {
        const clientId = await createMutation.mutateAsync(data);
        if (onClientCreated && clientId) {
          onClientCreated(clientId);
        }
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client:", error);
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? "Modifier le client" : "Nouveau client"}
      description={
        isEditing
          ? "Modifiez les informations du client ci-dessous."
          : "Remplissez les informations du nouveau client."
      }
      size="sm:max-w-[540px]"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto py-6 px-1">
          <div className="grid gap-6">
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

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
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
          </div>
        </div>

        <SheetFooter className="py-4 mt-auto">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
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
    </Slider>
  );
}
