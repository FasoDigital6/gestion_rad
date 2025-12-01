"use client";

import { useState, useMemo } from "react";
import { userData } from "@/lib/actions/auth/user";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserFormSheet } from "@/components/users/user-form-sheet";
import { deleteUserAction } from "@/lib/actions/users/user_actions";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns";

interface UsersPageClientProps {
  initialUsers: userData[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();

  const handleAddUser = () => {
    setIsFormOpen(true);
  };

  const handleUserCreated = () => {
    // Refresh the page to get updated users list
    router.refresh();
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`
      )
    ) {
      return;
    }

    try {
      const result = await deleteUserAction(userId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const columns = useMemo(() => createColumns(handleDeleteUser), []);

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

      <DataTable
        columns={columns}
        data={initialUsers}
        filterColumn="name"
        filterPlaceholder="Rechercher un utilisateur..."
      />

      <UserFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
