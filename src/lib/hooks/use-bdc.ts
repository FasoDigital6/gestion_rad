/**
 * Hooks React Query pour les Bons de Commande
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBDCs,
  getBDC,
  getBDCsByClient,
  createBDC,
  updateBDC,
  changerStatutBDC,
  deleteBDC,
} from "@/lib/firebase/api/bdc";
import type { CreateBDCInput, UpdateBDCInput, StatutBDC } from "@/lib/types";

/**
 * Hook pour récupérer tous les BDC
 */
export function useBDCs() {
  return useQuery({
    queryKey: ["bdc"],
    queryFn: getBDCs,
  });
}

/**
 * Hook pour récupérer un BDC par son ID
 */
export function useBDC(id: string) {
  return useQuery({
    queryKey: ["bdc", id],
    queryFn: () => getBDC(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les BDC d'un client
 */
export function useBDCsByClient(clientId: string) {
  return useQuery({
    queryKey: ["bdc", "client", clientId],
    queryFn: () => getBDCsByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour créer un BDC
 */
export function useCreateBDC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateBDCInput; userId: string }) =>
      createBDC(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
      queryClient.invalidateQueries({
        queryKey: ["bdc", "client", variables.data.clientId],
      });
      // Invalider aussi les proformas si créé depuis un proforma
      if (variables.data.proformaId) {
        queryClient.invalidateQueries({
          queryKey: ["proformas", variables.data.proformaId],
        });
        queryClient.invalidateQueries({ queryKey: ["proformas"] });
      }
    },
  });
}

/**
 * Hook pour mettre à jour un BDC
 */
export function useUpdateBDC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: UpdateBDCInput; userId: string }) =>
      updateBDC(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdc", variables.data.id] });
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
    },
  });
}

/**
 * Hook pour changer le statut d'un BDC
 */
export function useChangerStatutBDC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
      userId,
    }: {
      id: string;
      statut: StatutBDC;
      userId: string;
    }) => changerStatutBDC(id, statut, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdc", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
    },
  });
}

/**
 * Hook pour supprimer un BDC
 */
export function useDeleteBDC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBDC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
    },
  });
}
