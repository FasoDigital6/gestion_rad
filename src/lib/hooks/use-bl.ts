/**
 * Hooks React Query pour les Bons de Livraison
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBLs,
  getBL,
  getBLsByBDC,
  getBLsByClient,
  getBLsNonFactures,
  createBL,
  updateBL,
  changerStatutBL,
  deleteBL,
} from "@/lib/firebase/api/bl";
import type { CreateBLInput, UpdateBLInput, StatutBL } from "@/lib/types";

/**
 * Hook pour récupérer tous les BL
 */
export function useBLs() {
  return useQuery({
    queryKey: ["bl"],
    queryFn: getBLs,
  });
}

/**
 * Hook pour récupérer un BL par son ID
 */
export function useBL(id: string) {
  return useQuery({
    queryKey: ["bl", id],
    queryFn: () => getBL(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les BL d'un BDC
 */
export function useBLsByBDC(bdcId: string) {
  return useQuery({
    queryKey: ["bl", "bdc", bdcId],
    queryFn: () => getBLsByBDC(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * Hook pour récupérer les BL d'un client
 */
export function useBLsByClient(clientId: string) {
  return useQuery({
    queryKey: ["bl", "client", clientId],
    queryFn: () => getBLsByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour récupérer les BL non facturés d'un BDC
 */
export function useBLsNonFactures(bdcId: string) {
  return useQuery({
    queryKey: ["bl", "non-factures", bdcId],
    queryFn: () => getBLsNonFactures(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * Hook pour créer un BL
 */
export function useCreateBL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateBLInput; userId: string }) =>
      createBL(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bl"] });
      queryClient.invalidateQueries({
        queryKey: ["bl", "bdc", variables.data.bdcId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bl", "non-factures", variables.data.bdcId],
      });
      // Invalider le BDC pour mettre à jour les quantités
      queryClient.invalidateQueries({
        queryKey: ["bdc", variables.data.bdcId],
      });
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
    },
  });
}

/**
 * Hook pour mettre à jour un BL
 */
export function useUpdateBL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: UpdateBLInput; userId: string }) =>
      updateBL(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bl", variables.data.id] });
      queryClient.invalidateQueries({ queryKey: ["bl"] });
    },
  });
}

/**
 * Hook pour changer le statut d'un BL
 */
export function useChangerStatutBL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
      userId,
    }: {
      id: string;
      statut: StatutBL;
      userId: string;
    }) => changerStatutBL(id, statut, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bl", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bl"] });
    },
  });
}

/**
 * Hook pour supprimer un BL
 */
export function useDeleteBL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBL,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bl"] });
    },
  });
}
