"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2, CheckCircle2, Copy } from "lucide-react";
import { createUserAction } from "@/lib/actions/users/user_actions";
import { createUserSchema, CreateUserInput } from "@/lib/schemas/user-schema";

type UserFormValues = CreateUserInput;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void;
}

export function UserFormSheet({
  open,
  onOpenChange,
  onUserCreated,
}: UserFormSheetProps) {
  const [resetLink, setResetLink] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!open) {
      // Reset form when closed
      reset();
      setResetLink("");
      setShowSuccess(false);
      setCopied(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      const result = await createUserAction(data);

      if (result.error) {
        setError("root", { message: result.error });
        return;
      }

      if (result.success && result.resetLink) {
        setResetLink(result.resetLink);
        setShowSuccess(true);
        if (onUserCreated) {
          onUserCreated();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      setError("root", { message: "Erreur inattendue" });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (showSuccess && resetLink) {
    return (
      <Slider
        isOpen={open}
        onClose={handleClose}
        title="Utilisateur créé avec succès"
        description="L'utilisateur a été créé. Partagez ce lien pour qu'il définisse son mot de passe."
        size="sm:max-w-[540px]"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Utilisateur créé avec succès !
                  </p>
                  <p className="text-sm text-green-700">
                    Un email a été automatiquement envoyé à l'utilisateur
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>L'utilisateur va recevoir un email</strong> avec un lien pour définir son mot de passe.
                  Vérifiez que l'email ne soit pas dans les spams.
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel>
                  Lien de secours (si l'email n'arrive pas)
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={resetLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez copier ce lien et l'envoyer manuellement à l'utilisateur si nécessaire.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="py-5 px-6 border-t border-border bg-background gap-3 flex-row justify-end">
            <Button
              type="button"
              onClick={handleClose}
              className="h-11 px-8 bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all min-w-[180px]"
            >
              Fermer
            </Button>
          </SheetFooter>
        </div>
      </Slider>
    );
  }

  return (
    <Slider
      isOpen={open}
      onClose={handleClose}
      title="Nouvel utilisateur"
      description="Créez un nouveau compte utilisateur. Un lien de réinitialisation de mot de passe sera généré."
      size="sm:max-w-[540px]"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="grid gap-6">
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                {errors.root.message}
              </div>
            )}

            <Field data-invalid={!!errors.name} className="space-y-2">
              <FieldLabel htmlFor="name">
                Nom complet <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="name"
                placeholder="Ex: Mohamed Camara"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

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

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Après la création, Firebase enverra automatiquement
                un email à l'utilisateur avec un lien pour définir son mot de passe.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="py-5 px-6 border-t border-border bg-background gap-3 flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
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
                Création...
              </>
            ) : (
              "Créer l'utilisateur"
            )}
          </Button>
        </SheetFooter>
      </form>
    </Slider>
  );
}
