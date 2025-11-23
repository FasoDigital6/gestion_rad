import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
} from "@/lib/firebase/api/clients";
import { CreateClientInput, UpdateClientInput } from "@/lib/types/client";

/**
 * Hook pour récupérer la liste de tous les clients
 */
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
}

/**
 * Hook pour récupérer un client par son ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id),
    enabled: !!id,
  });
}

/**
 * Hook pour créer un nouveau client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      // Invalider le cache pour refetch la liste des clients
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook pour mettre à jour un client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_, variables) => {
      // Invalider le cache pour le client spécifique et la liste
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook pour supprimer un client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      // Invalider le cache pour refetch la liste des clients
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Hook pour activer/désactiver un client
 */
export function useToggleClientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statut,
    }: {
      id: string;
      statut: "actif" | "inactif";
    }) => toggleClientStatus(id, statut),
    onSuccess: (_, variables) => {
      // Invalider le cache pour le client spécifique et la liste
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
