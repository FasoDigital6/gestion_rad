import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBdcs,
  getBdc,
  getBdcsByClient,
  getBdcsByProforma,
  createBdc,
  createBdcFromProforma,
  updateBdc,
  deleteBdc,
  updateBdcStatut,
} from "@/lib/firebase/api/bdc";
import {
  CreateBdcInput,
  UpdateBdcInput,
  UpdateBdcStatutInput,
} from "@/lib/types/bdc";

/**
 * Hook pour récupérer tous les BDCs
 */
export function useBdcs() {
  return useQuery({
    queryKey: ["bdcs"],
    queryFn: getBdcs,
  });
}

/**
 * Hook pour récupérer un BDC par ID
 */
export function useBdc(id: string) {
  return useQuery({
    queryKey: ["bdc", id],
    queryFn: () => getBdc(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les BDCs d'un client
 */
export function useBdcsByClient(clientId: string) {
  return useQuery({
    queryKey: ["bdcs", "client", clientId],
    queryFn: () => getBdcsByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour récupérer les BDCs créés depuis un proforma
 */
export function useBdcsByProforma(proformaId: string) {
  return useQuery({
    queryKey: ["bdcs", "proforma", proformaId],
    queryFn: () => getBdcsByProforma(proformaId),
    enabled: !!proformaId,
  });
}

/**
 * Hook pour créer un nouveau BDC
 */
export function useCreateBdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBdcInput) => createBdc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bdcs"] });
    },
  });
}

/**
 * Hook pour créer un BDC depuis un proforma validé
 */
export function useCreateBdcFromProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proformaId: string) => createBdcFromProforma(proformaId),
    onSuccess: (bdcId, proformaId) => {
      queryClient.invalidateQueries({ queryKey: ["bdcs"] });
      queryClient.invalidateQueries({
        queryKey: ["bdcs", "proforma", proformaId],
      });
    },
  });
}

/**
 * Hook pour mettre à jour un BDC
 */
export function useUpdateBdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBdcInput) => updateBdc(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdcs"] });
      queryClient.invalidateQueries({ queryKey: ["bdc", variables.id] });
    },
  });
}

/**
 * Hook pour changer le statut d'un BDC
 */
export function useUpdateBdcStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBdcStatutInput) => updateBdcStatut(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bdcs"] });
      queryClient.invalidateQueries({ queryKey: ["bdc", variables.id] });
    },
  });
}

/**
 * Hook pour supprimer un BDC
 */
export function useDeleteBdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBdc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bdcs"] });
    },
  });
}
