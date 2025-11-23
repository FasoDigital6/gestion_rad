"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/lib/types/client";
import { useToggleClientStatus } from "@/lib/hooks/use-clients";

interface ClientActionsProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientActions({ client, onEdit }: ClientActionsProps) {
  const toggleStatusMutation = useToggleClientStatus();

  const handleToggleStatus = async () => {
    const newStatus = client.statut === "actif" ? "inactif" : "actif";
    await toggleStatusMutation.mutateAsync({
      id: client.id,
      statut: newStatus,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(client.id)}
        >
          Copier l&apos;ID client
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(client)}>
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleStatus}
          className="text-red-600"
          disabled={toggleStatusMutation.isPending}
        >
          {toggleStatusMutation.isPending
            ? "Chargement..."
            : client.statut === "actif"
            ? "Désactiver"
            : "Activer"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
