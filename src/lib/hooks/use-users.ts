import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "@/lib/firebase/api/users";

/**
 * Hook pour récupérer la liste de tous les utilisateurs
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}

/**
 * Hook pour récupérer un utilisateur par son ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

/**
 * Hook pour créer un nouvel utilisateur
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalider le cache pour refetch la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Hook pour mettre à jour un utilisateur
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_, variables) => {
      // Invalider le cache pour l'utilisateur spécifique et la liste
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Hook pour supprimer un utilisateur
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalider le cache pour refetch la liste des utilisateurs
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/**
 * Hook pour activer/désactiver un utilisateur
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      disabled,
    }: {
      id: string;
      disabled: boolean;
    }) => toggleUserStatus(id, disabled),
    onSuccess: (_, variables) => {
      // Invalider le cache pour l'utilisateur spécifique et la liste
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
