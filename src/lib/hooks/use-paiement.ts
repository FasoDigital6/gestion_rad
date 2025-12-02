import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaiementsByFacture,
  getPaiementsByClient,
  getPaiement,
  addPaiement,
  deletePaiement,
  getFacturePaiementsSummary,
} from "@/lib/firebase/api/paiement";
import type { CreatePaiementInput } from "@/lib/types/paiement";

/**
 * Hook pour récupérer tous les paiements d'une facture
 */
export function usePaiementsByFacture(factureId: string) {
  return useQuery({
    queryKey: ["paiements", "facture", factureId],
    queryFn: () => getPaiementsByFacture(factureId),
    enabled: !!factureId,
  });
}

/**
 * Hook pour récupérer tous les paiements d'un client
 */
export function usePaiementsByClient(clientId: string) {
  return useQuery({
    queryKey: ["paiements", "client", clientId],
    queryFn: () => getPaiementsByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour récupérer un paiement par ID
 */
export function usePaiement(id: string) {
  return useQuery({
    queryKey: ["paiement", id],
    queryFn: () => getPaiement(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer le résumé des paiements d'une facture
 */
export function useFacturePaiementsSummary(factureId: string) {
  return useQuery({
    queryKey: ["facture-paiements-summary", factureId],
    queryFn: () => getFacturePaiementsSummary(factureId),
    enabled: !!factureId,
  });
}

/**
 * Hook pour ajouter un paiement (TRANSACTION CRITIQUE)
 */
export function useAddPaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaiementInput) => addPaiement(data),
    onSuccess: (paiementId, variables) => {
      // Invalider les paiements de cette facture
      queryClient.invalidateQueries({
        queryKey: ["paiements", "facture", variables.factureId],
      });

      // Invalider le résumé des paiements
      queryClient.invalidateQueries({
        queryKey: ["facture-paiements-summary", variables.factureId],
      });

      // Invalider la facture (totaux et statut ont changé)
      queryClient.invalidateQueries({
        queryKey: ["facture", variables.factureId],
      });
      queryClient.invalidateQueries({ queryKey: ["factures"] });

      // Invalider les totaux client
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook pour supprimer un paiement (ADMIN SEULEMENT)
 */
export function useDeletePaiement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaiement(id),
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux paiements et factures
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      queryClient.invalidateQueries({ queryKey: ["facture-paiements-summary"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
