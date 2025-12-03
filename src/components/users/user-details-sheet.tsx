"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, UserX, Mail, Phone, MapPin, Briefcase, Edit, Trash2 } from "lucide-react";
import { useToggleUserStatus } from "@/lib/hooks/use-users";
import { User } from "@/lib/firebase/api/users";
import { toast } from "sonner";

interface UserDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserDetailsSheet({
  open,
  onOpenChange,
  user,
  onEdit,
  onDelete,
}: UserDetailsSheetProps) {
  const toggleStatusMutation = useToggleUserStatus();

  if (!user) return null;

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        disabled: !user.disabled,
      });
      toast.success(
        user.disabled
          ? "Utilisateur activé avec succès"
          : "Utilisateur désactivé avec succès"
      );
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error(error.message || "Erreur lors du changement de statut");
    }
  };

  return (
    <Slider
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Détails de l'utilisateur"
      description="Consultez et gérez les informations de l'utilisateur"
      size="sm:max-w-[540px]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="space-y-6">
            {/* Statut */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Statut du compte</p>
                  <Badge
                    variant={user.disabled ? "destructive" : "default"}
                    className="mt-1"
                  >
                    {user.disabled ? "Désactivé" : "Actif"}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleToggleStatus}
                disabled={toggleStatusMutation.isPending}
                variant={user.disabled ? "default" : "destructive"}
                size="sm"
                className="gap-2"
              >
                {toggleStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : user.disabled ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activer
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4" />
                    Désactiver
                  </>
                )}
              </Button>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">
                Informations personnelles
              </h3>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Nom</p>
                    <p className="text-base text-gray-900">{user.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Prénom</p>
                    <p className="text-base text-gray-900">{user.prenom}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.telephone && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Téléphone</p>
                      <p className="text-base text-gray-900">{user.telephone}</p>
                    </div>
                  </div>
                )}

                {user.poste && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Poste</p>
                      <p className="text-base text-gray-900">{user.poste}</p>
                    </div>
                  </div>
                )}

                {user.adresse && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Adresse</p>
                      <p className="text-base text-gray-900">{user.adresse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rôle et permissions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">Rôle et permissions</h3>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Rôle</p>
                <Badge variant="default" className="bg-indigo-600">
                  {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                </Badge>
              </div>
            </div>

            {/* Informations système */}
            {user.createdAt && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900">
                  Informations système
                </h3>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date de création</p>
                  <p className="text-base text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="py-5 px-6 border-t border-border bg-background gap-3 flex-row justify-between">
          <div className="flex gap-3">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onEdit(user);
                  onOpenChange(false);
                }}
                className="h-11 px-6 gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(user);
                  onOpenChange(false);
                }}
                className="h-11 px-6 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 min-w-[120px]"
          >
            Fermer
          </Button>
        </SheetFooter>
      </div>
    </Slider>
  );
}
