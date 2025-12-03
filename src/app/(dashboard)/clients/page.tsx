"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns-wrapper";
import { Client } from "@/lib/types/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useClients } from "@/lib/hooks/use-clients";
import { ClientFormSheet } from "@/components/clients/client-form-sheet";

export default function ClientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading, error } = useClients();

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const columns = useMemo(() => createColumns(handleEditClient), []);

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez votre base clients et consultez leur historique
          </p>
        </div>
        <Button onClick={handleAddClient} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Erreur lors du chargement des clients
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={clients || []}
          filterColumn="nom"
          filterPlaceholder="Rechercher un client..."
        />
      )}

      <ClientFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={selectedClient}
      />
    </div>
  );
}
