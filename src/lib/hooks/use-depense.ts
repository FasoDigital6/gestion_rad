import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepenses,
  getDepense,
  getDepensesByBdc,
  createDepense,
  updateDepense,
  deleteDepense,
} from "@/lib/firebase/api/depense";
import type { CreateDepenseInput, UpdateDepenseInput } from "@/lib/types/depense";

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
    queryKey: ["depense", id],
    queryFn: () => getDepense(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les dépenses liées à un BDC
 */
export function useDepensesByBdc(bdcId: string) {
  return useQuery({
    queryKey: ["depenses", "bdc", bdcId],
    queryFn: () => getDepensesByBdc(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * Hook pour créer une nouvelle dépense
 */
export function useCreateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
      userName,
    }: {
      data: CreateDepenseInput;
      userId?: string;
      userName?: string;
    }) => createDepense(data, userId, userName),
    onSuccess: () => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}

/**
 * Hook pour mettre à jour une dépense
 */
export function useUpdateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDepenseInput) => updateDepense(data),
    onSuccess: (_, variables) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["depense", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}

/**
 * Hook pour supprimer une dépense
 */
export function useDeleteDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepense(id),
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });
}
