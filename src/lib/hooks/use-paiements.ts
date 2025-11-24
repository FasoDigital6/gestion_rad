/**
 * Hooks React Query pour les Paiements
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaiements,
  getPaiement,
  getPaiementsByFacture,
  getPaiementsByClient,
  getRecapitulatifPaiementsFacture,
  createPaiement,
  updatePaiement,
  changerStatutPaiement,
  deletePaiement,
} from "@/lib/firebase/api/paiements";
import type {
  CreatePaiementInput,
  UpdatePaiementInput,
  StatutPaiement,
} from "@/lib/types";

/**
 * Hook pour récupérer tous les paiements
 */
export function usePaiements() {
  return useQuery({
    queryKey: ["paiements"],
    queryFn: getPaiements,
  });
}

/**
 * Hook pour récupérer un paiement par son ID
 */
export function usePaiement(id: string) {
  return useQuery({
    queryKey: ["paiements", id],
    queryFn: () => getPaiement(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les paiements d'une facture
 */
export function usePaiementsByFacture(factureId: string) {
  return useQuery({
    queryKey: ["paiements", "facture", factureId],
    queryFn: () => getPaiementsByFacture(factureId),
    enabled: !!factureId,
  });
}

/**
 * Hook pour récupérer les paiements d'un client
 */
export function usePaiementsByClient(clientId: string) {
  return useQuery({
    queryKey: ["paiements", "client", clientId],
    queryFn: () => getPaiementsByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour récupérer le récapitulatif des paiements d'une facture
 */
export function useRecapitulatifPaiementsFacture(factureId: string) {
  return useQuery({
    queryKey: ["paiements", "recapitulatif", factureId],
    queryFn: () => getRecapitulatifPaiementsFacture(factureId),
    enabled: !!factureId,
  });
}

/**
 * Hook pour créer un paiement
 */
export function useCreatePaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: CreatePaiementInput;
      userId: string;
    }) => createPaiement(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
      queryClient.invalidateQueries({
        queryKey: ["paiements", "facture", variables.data.factureId],
      });
      queryClient.invalidateQueries({
        queryKey: ["paiements", "recapitulatif", variables.data.factureId],
      });
      // Invalider la facture pour mettre à jour les montants
      queryClient.invalidateQueries({
        queryKey: ["factures", variables.data.factureId],
      });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}

/**
 * Hook pour mettre à jour un paiement
 */
export function useUpdatePaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: UpdatePaiementInput;
      userId: string;
    }) => updatePaiement(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["paiements", variables.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
    },
  });
}

/**
 * Hook pour changer le statut d'un paiement
 */
export function useChangerStatutPaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
      userId,
    }: {
      id: string;
      statut: StatutPaiement;
      userId: string;
    }) => changerStatutPaiement(id, statut, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paiements", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
    },
  });
}

/**
 * Hook pour supprimer un paiement
 */
export function useDeletePaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePaiement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
    },
  });
}
