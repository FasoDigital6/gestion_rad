"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns";
import { User } from "@/lib/firebase/api/users";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUsers, useDeleteUser } from "@/lib/hooks/use-users";
import { UserFormSheet } from "@/components/users/user-form-sheet";
import { UserDetailsSheet } from "@/components/users/user-details-sheet";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleAddUser = () => {
    setIsFormOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success("Utilisateur supprimé avec succès");
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  const columns = useMemo(() => createColumns(handleViewUser, handleDeleteUser), []);

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs de votre application
          </p>
        </div>
        <Button onClick={handleAddUser} className="bg-brand hover:bg-brand/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des utilisateurs
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users || []}
          filterColumn="nom"
          filterPlaceholder="Rechercher un utilisateur..."
        />
      )}

      <UserFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <UserDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        user={selectedUser}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>
                {userToDelete?.prenom} {userToDelete?.nom}
              </strong>{" "}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
