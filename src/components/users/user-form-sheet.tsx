"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-users";
import { createUserSchema, CreateUserInput } from "@/lib/schemas/user-schema";
import { User } from "@/lib/firebase/api/users";
import { toast } from "sonner";

type UserFormValues = CreateUserInput;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormSheet({
  open,
  onOpenChange,
  user,
}: UserFormSheetProps) {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      poste: "",
      adresse: "",
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone || "",
        poste: user.poste || "",
        adresse: user.adresse || "",
      });
    } else if (!open) {
      reset({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        poste: "",
        adresse: "",
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing && user) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          ...data,
        });
        toast.success("Utilisateur modifié avec succès.");
      } else {
        await createUserMutation.mutateAsync(data);
        toast.success("Utilisateur créé avec succès. Un email a été envoyé à l'utilisateur.");
      }
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error(`Erreur lors de la ${isEditing ? 'modification' : 'création'} de l'utilisateur:`, error);
      toast.error(error.message || `Erreur lors de la ${isEditing ? 'modification' : 'création'} de l'utilisateur`);
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      description={isEditing ? "Modifiez les informations de l'utilisateur." : "Créez un nouveau compte utilisateur. Un email sera envoyé pour définir le mot de passe."}
      size="sm:max-w-[540px]"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.nom} className="space-y-2">
                <FieldLabel htmlFor="nom">
                  Nom <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="nom"
                  placeholder="Ex: Camara"
                  {...register("nom")}
                  aria-invalid={!!errors.nom}
                />
                {errors.nom && <FieldError errors={[errors.nom]} />}
              </Field>

              <Field data-invalid={!!errors.prenom} className="space-y-2">
                <FieldLabel htmlFor="prenom">
                  Prénom <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="prenom"
                  placeholder="Ex: Mohamed"
                  {...register("prenom")}
                  aria-invalid={!!errors.prenom}
                />
                {errors.prenom && <FieldError errors={[errors.prenom]} />}
              </Field>
            </div>

            <Field data-invalid={!!errors.email} className="space-y-2">
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="exemple@radguinee.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.telephone} className="space-y-2">
                <FieldLabel htmlFor="telephone">
                  Téléphone
                </FieldLabel>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+224 XXX XX XX XX"
                  {...register("telephone")}
                  aria-invalid={!!errors.telephone}
                />
                {errors.telephone && <FieldError errors={[errors.telephone]} />}
              </Field>

              <Field data-invalid={!!errors.poste} className="space-y-2">
                <FieldLabel htmlFor="poste">
                  Poste
                </FieldLabel>
                <Input
                  id="poste"
                  placeholder="Ex: Responsable commercial"
                  {...register("poste")}
                  aria-invalid={!!errors.poste}
                />
                {errors.poste && <FieldError errors={[errors.poste]} />}
              </Field>
            </div>

            <Field data-invalid={!!errors.adresse} className="space-y-2">
              <FieldLabel htmlFor="adresse">
                Adresse
              </FieldLabel>
              <Input
                id="adresse"
                placeholder="Ex: Conakry, Guinée"
                {...register("adresse")}
                aria-invalid={!!errors.adresse}
              />
              {errors.adresse && <FieldError errors={[errors.adresse]} />}
            </Field>

            {!isEditing && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Après la création, Firebase enverra automatiquement
                  un email à l'utilisateur avec un lien pour définir son mot de passe.
                </p>
              </div>
            )}
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
                {isEditing ? "Modification..." : "Création..."}
              </>
            ) : (
              isEditing ? "Modifier l'utilisateur" : "Créer l'utilisateur"
            )}
          </Button>
        </SheetFooter>
      </form>
    </Slider>
  );
}
