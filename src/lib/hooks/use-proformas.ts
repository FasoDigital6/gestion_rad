/**
 * Hooks React Query pour les Proformas
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProformas,
  getProforma,
  getProformasByClient,
  createProforma,
  updateProforma,
  changerStatutProforma,
  deleteProforma,
} from "@/lib/firebase/api/proformas";
import type {
  CreateProformaInput,
  UpdateProformaInput,
  StatutProforma,
} from "@/lib/types";

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
 * Hook pour récupérer un proforma par son ID
 */
export function useProforma(id: string) {
  return useQuery({
    queryKey: ["proformas", id],
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
 * Hook pour créer un proforma
 */
export function useCreateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: CreateProformaInput;
      userId: string;
    }) => createProforma(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
      queryClient.invalidateQueries({
        queryKey: ["proformas", "client", variables.data.clientId],
      });
    },
  });
}

/**
 * Hook pour mettre à jour un proforma
 */
export function useUpdateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: UpdateProformaInput;
      userId: string;
    }) => updateProforma(data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["proformas", variables.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
    },
  });
}

/**
 * Hook pour changer le statut d'un proforma
 */
export function useChangerStatutProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
      userId,
    }: {
      id: string;
      statut: StatutProforma;
      userId: string;
    }) => changerStatutProforma(id, statut, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proformas", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
    },
  });
}

/**
 * Hook pour supprimer un proforma
 */
export function useDeleteProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProforma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proformas"] });
    },
  });
}
