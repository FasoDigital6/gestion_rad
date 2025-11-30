import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFactures,
  getFacture,
  getFacturesByClient,
  getFacturesFromBdl,
  createFactureFromBdls,
  createFactureManuelle,
  updateFacture,
  deleteFacture,
  updateFactureStatut,
} from "@/lib/firebase/api/facture";
import type {
  CreateFactureFromBdlsInput,
  CreateFactureManueleInput,
  UpdateFactureInput,
  UpdateFactureStatutInput,
} from "@/lib/types/facture";

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
 * Hook pour récupérer une facture par ID
 */
export function useFacture(id: string) {
  return useQuery({
    queryKey: ["facture", id],
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
 * Hook pour récupérer les factures contenant un BDL
 */
export function useFacturesFromBdl(bdlId: string) {
  return useQuery({
    queryKey: ["factures", "bdl", bdlId],
    queryFn: () => getFacturesFromBdl(bdlId),
    enabled: !!bdlId,
  });
}

/**
 * Hook pour créer une facture depuis des BDL
 */
export function useCreateFactureFromBdls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFactureFromBdlsInput) =>
      createFactureFromBdls(data),
    onSuccess: (factureId, variables) => {
      // Invalider les listes de factures
      queryClient.invalidateQueries({ queryKey: ["factures"] });

      // Invalider les factures par BDL
      variables.bdlIds.forEach((bdlId) => {
        queryClient.invalidateQueries({ queryKey: ["factures", "bdl", bdlId] });
        queryClient.invalidateQueries({ queryKey: ["bdl", bdlId] });
      });

      // Invalider la liste des BDL (car ils ont maintenant factureId)
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
    },
  });
}

/**
 * Hook pour créer une facture manuellement
 */
export function useCreateFactureManuelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFactureManueleInput) =>
      createFactureManuelle(data),
    onSuccess: (factureId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      queryClient.invalidateQueries({
        queryKey: ["factures", "client", variables.clientId],
      });
    },
  });
}

/**
 * Hook pour mettre à jour une facture (seulement BROUILLON)
 */
export function useUpdateFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFactureInput) => updateFacture(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      queryClient.invalidateQueries({ queryKey: ["facture", variables.id] });
    },
  });
}

/**
 * Hook pour changer le statut d'une facture
 */
export function useUpdateFactureStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFactureStatutInput) => updateFactureStatut(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      queryClient.invalidateQueries({ queryKey: ["facture", variables.id] });

      // Invalider les totaux client si passage à EMISE ou ANNULEE
      if (variables.statut === "EMISE" || variables.statut === "ANNULEE") {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      }

      // Si annulation, invalider les BDL
      if (variables.statut === "ANNULEE") {
        queryClient.invalidateQueries({ queryKey: ["bdls"] });
      }
    },
  });
}

/**
 * Hook pour supprimer une facture (seulement BROUILLON)
 */
export function useDeleteFacture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFacture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },
  });
}
