/**
 * Hooks React Query pour les Factures
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFactures,
  getFacture,
  getFacturesByClient,
  getFacturesByBDC,
  genererApercuFacture,
  createFacture,
  updateFacture,
  changerStatutFacture,
  deleteFacture,
  enregistrerRelance,
} from "@/lib/firebase/api/factures";
import type {
  CreateFactureInput,
  UpdateFactureInput,
  StatutFacture,
} from "@/lib/types";

/**
 * Hook pour récupérer toutes les factures
 */
export function useFactures() {
  return useQuery({
    queryKey: ["factures"],
    queryFn: getFactures,
  });
}

/**
 * Hook pour récupérer une facture par son ID
 */
export function useFacture(id: string) {
  return useQuery({
    queryKey: ["factures", id],
    queryFn: () => getFacture(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les factures d'un client
 */
export function useFacturesByClient(clientId: string) {
  return useQuery({
    queryKey: ["factures", "client", clientId],
    queryFn: () => getFacturesByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour récupérer les factures d'un BDC
 */
export function useFacturesByBDC(bdcId: string) {
  return useQuery({
    queryKey: ["factures", "bdc", bdcId],
    queryFn: () => getFacturesByBDC(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * Hook pour générer un aperçu de facture
 */
export function useGenererApercuFacture() {
  return useMutation({
    mutationFn: ({ bdcId, blIds }: { bdcId: string; blIds: string[] }) =>
      genererApercuFacture(bdcId, blIds),
  });
}

/**
 * Hook pour créer une facture
 */
export function useCreateFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: CreateFactureInput;
      userId: string;
    }) => createFacture(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      queryClient.invalidateQueries({
        queryKey: ["factures", "bdc", variables.data.bdcId],
      });
      // Invalider les BL pour mettre à jour leur statut
      variables.data.blIds.forEach((blId) => {
        queryClient.invalidateQueries({ queryKey: ["bl", blId] });
      });
      queryClient.invalidateQueries({ queryKey: ["bl"] });
      // Invalider le BDC
      queryClient.invalidateQueries({
        queryKey: ["bdc", variables.data.bdcId],
      });
      queryClient.invalidateQueries({ queryKey: ["bdc"] });
    },
  });
}

/**
 * Hook pour mettre à jour une facture
 */
export function useUpdateFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: UpdateFactureInput;
      userId: string;
    }) => updateFacture(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["factures", variables.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}

/**
 * Hook pour changer le statut d'une facture
 */
export function useChangerStatutFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
      userId,
    }: {
      id: string;
      statut: StatutFacture;
      userId: string;
    }) => changerStatutFacture(id, statut, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factures", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}

/**
 * Hook pour supprimer une facture
 */
export function useDeleteFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFacture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}

/**
 * Hook pour enregistrer une relance
 */
export function useEnregistrerRelance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ factureId, userId }: { factureId: string; userId: string }) =>
      enregistrerRelance(factureId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["factures", variables.factureId],
      });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}
