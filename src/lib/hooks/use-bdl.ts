import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBdls,
  getBdl,
  getBdlsByBdc,
  getBdcDeliveryProgress,
  createBdl,
  createBdlFromBdc,
  updateBdl,
  deleteBdl,
  updateBdlStatut,
} from "@/lib/firebase/api/bdl";
import {
  CreateBdlInput,
  UpdateBdlInput,
  UpdateBdlStatutInput,
} from "@/lib/types/bdl";

/**
 * Hook pour récupérer tous les BDLs
 */
export function useBdls() {
  return useQuery({
    queryKey: ["bdls"],
    queryFn: getBdls,
  });
}

/**
 * Hook pour récupérer un BDL par ID
 */
export function useBdl(id: string) {
  return useQuery({
    queryKey: ["bdl", id],
    queryFn: () => getBdl(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les BDLs créés depuis un BDC
 */
export function useBdlsByBdc(bdcId: string) {
  return useQuery({
    queryKey: ["bdls", "bdc", bdcId],
    queryFn: () => getBdlsByBdc(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * HOOK CRITIQUE : Récupérer la progression de livraison d'un BDC
 * Calcule les quantités restantes pour chaque ligne
 */
export function useBdcDeliveryProgress(bdcId: string) {
  return useQuery({
    queryKey: ["bdc-delivery-progress", bdcId],
    queryFn: () => getBdcDeliveryProgress(bdcId),
    enabled: !!bdcId,
  });
}

/**
 * Hook pour créer un nouveau BDL
 */
export function useCreateBdl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBdlInput) => createBdl(data),
    onSuccess: (bdlId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
      queryClient.invalidateQueries({
        queryKey: ["bdls", "bdc", variables.bdcId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bdc-delivery-progress", variables.bdcId],
      });
    },
  });
}

/**
 * HOOK CRITIQUE : Créer un BDL depuis un BDC avec validation
 */
export function useCreateBdlFromBdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bdcId,
      deliveryData,
    }: {
      bdcId: string;
      deliveryData: {
        dateLivraison: Date;
        heureLivraison?: string;
        nomLivreur?: string;
        observations?: string;
        signatureReception?: string;
        lignes: Array<{ ligneNumero: number; quantiteLivree: number }>;
        notes?: string;
      };
    }) => createBdlFromBdc(bdcId, deliveryData),
    onSuccess: (bdlId, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
      queryClient.invalidateQueries({
        queryKey: ["bdls", "bdc", variables.bdcId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bdc-delivery-progress", variables.bdcId],
      });
    },
  });
}

/**
 * Hook pour mettre à jour un BDL
 */
export function useUpdateBdl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBdlInput) => updateBdl(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
      queryClient.invalidateQueries({ queryKey: ["bdl", variables.id] });
      // Invalider aussi la progression du BDC si les quantités changent
      if (variables.lignes) {
        const bdcId = variables.bdcId;
        if (bdcId) {
          queryClient.invalidateQueries({
            queryKey: ["bdc-delivery-progress", bdcId],
          });
        }
      }
    },
  });
}

/**
 * Hook pour changer le statut d'un BDL
 */
export function useUpdateBdlStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBdlStatutInput) => updateBdlStatut(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
      queryClient.invalidateQueries({ queryKey: ["bdl", variables.id] });
    },
  });
}

/**
 * Hook pour supprimer un BDL
 */
export function useDeleteBdl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bdcId }: { id: string; bdcId: string }) => deleteBdl(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdls"] });
      queryClient.invalidateQueries({
        queryKey: ["bdls", "bdc", variables.bdcId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bdc-delivery-progress", variables.bdcId],
      });
    },
  });
}
