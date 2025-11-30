"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

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
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="grid gap-6">
            <Field data-invalid={!!errors.nom} className="space-y-2">
              <FieldLabel htmlFor="nom">
                Nom du client <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="nom"
                placeholder="Ex: SAG Burkina"
                {...register("nom")}
                aria-invalid={!!errors.nom}
              />
              {errors.nom && (
                <FieldError errors={[errors.nom]} />
              )}
            </Field>

            <Field data-invalid={!!errors.telephone} className="space-y-2">
              <FieldLabel htmlFor="telephone">
                Téléphone <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="telephone"
                placeholder="+226 25 30 30 30"
                {...register("telephone")}
                aria-invalid={!!errors.telephone}
              />
              {errors.telephone && (
                <FieldError errors={[errors.telephone]} />
              )}
            </Field>

            <Field data-invalid={!!errors.adresse} className="space-y-2">
              <FieldLabel htmlFor="adresse">
                Adresse <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="adresse"
                placeholder="Ouagadougou, Burkina Faso"
                {...register("adresse")}
                aria-invalid={!!errors.adresse}
              />
              {errors.adresse && (
                <FieldError errors={[errors.adresse]} />
              )}
            </Field>

            <Field data-invalid={!!errors.email} className="space-y-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="contact@exemple.bf"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <FieldError errors={[errors.email]} />
              )}
            </Field>

            <Field data-invalid={!!errors.rccm} className="space-y-2">
              <FieldLabel htmlFor="rccm">RCCM (Optionnel)</FieldLabel>
              <Input
                id="rccm"
                placeholder="BF-OUA-01-2020-B12-00001"
                {...register("rccm")}
                aria-invalid={!!errors.rccm}
              />
              {errors.rccm && (
                <FieldError errors={[errors.rccm]} />
              )}
            </Field>
          </div>
        </div>

        <SheetFooter className="py-5 px-6 border-t border-border bg-background gap-3 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 min-w-[120px]"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-8 bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all min-w-[180px]"
          >
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
