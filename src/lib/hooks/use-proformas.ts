import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProformas,
  getProforma,
  getProformasByClient,
  createProforma,
  updateProforma,
  deleteProforma,
  updateProformaStatut,
} from "@/lib/firebase/api/proformas";
import {
  CreateProformaInput,
  UpdateProformaInput,
  UpdateProformaStatutInput,
} from "@/lib/types/proforma";

/**
 * Hook pour récupérer tous les proformas
 */
export function useProformas() {
  return useQuery({
    queryKey: ["proformas"],
    queryFn: getProformas,
  });
}

/**
 * Hook pour récupérer un proforma par ID
 */
export function useProforma(id: string) {
  return useQuery({
    queryKey: ["proforma", id],
    queryFn: () => getProforma(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les proformas d'un client
 */
export function useProformasByClient(clientId: string) {
  return useQuery({
    queryKey: ["proformas", "client", clientId],
    queryFn: () => getProformasByClient(clientId),
    enabled: !!clientId,
  });
}

/**
 * Hook pour créer un nouveau proforma
 */
export function useCreateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProformaInput) => createProforma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
    },
  });
}

/**
 * Hook pour mettre à jour un proforma
 */
export function useUpdateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProformaInput) => updateProforma(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      queryClient.invalidateQueries({ queryKey: ["proforma", variables.id] });
    },
  });
}

/**
 * Hook pour changer le statut d'un proforma
 */
export function useUpdateProformaStatut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProformaStatutInput) => updateProformaStatut(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      queryClient.invalidateQueries({ queryKey: ["proforma", variables.id] });
    },
  });
}

/**
 * Hook pour supprimer un proforma
 */
export function useDeleteProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProforma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
    },
  });
}
