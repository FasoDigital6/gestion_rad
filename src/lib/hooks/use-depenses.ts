/**
 * Hooks React Query pour les Dépenses
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDepenses,
  getDepense,
  getStatistiquesDepenses,
  createDepense,
  updateDepense,
  deleteDepense,
} from "@/lib/firebase/api/depenses";
import type { CreateDepenseInput, UpdateDepenseInput } from "@/lib/types";

/**
 * Hook pour récupérer toutes les dépenses
 */
export function useDepenses() {
  return useQuery({
    queryKey: ["depenses"],
    queryFn: getDepenses,
  });
}

/**
 * Hook pour récupérer une dépense par son ID
 */
export function useDepense(id: string) {
  return useQuery({
    queryKey: ["depenses", id],
    queryFn: () => getDepense(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les statistiques des dépenses
 */
export function useStatistiquesDepenses() {
  return useQuery({
    queryKey: ["depenses", "statistiques"],
    queryFn: getStatistiquesDepenses,
  });
}

/**
 * Hook pour créer une dépense
 */
export function useCreateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: CreateDepenseInput;
      userId: string;
    }) => createDepense(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["depenses", "statistiques"] });
    },
  });
}

/**
 * Hook pour mettre à jour une dépense
 */
export function useUpdateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: UpdateDepenseInput;
      userId: string;
    }) => updateDepense(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["depenses", variables.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["depenses", "statistiques"] });
    },
  });
}

/**
 * Hook pour supprimer une dépense
 */
export function useDeleteDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["depenses", "statistiques"] });
    },
  });
}
