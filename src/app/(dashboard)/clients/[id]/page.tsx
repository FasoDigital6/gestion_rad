"use client";

import { useParams, useRouter } from "next/navigation";
import { useClient } from "@/lib/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { ClientInfoCard } from "@/components/clients/client-info-card";
import { ClientFinancialStats } from "@/components/clients/client-financial-stats";
import { ClientDocumentsTabs } from "@/components/clients/client-documents-tabs";
import { useState } from "react";
import { ClientFormSheet } from "@/components/clients/client-form-sheet";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { data: client, isLoading, error } = useClient(clientId);
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600">
            Erreur lors du chargement du client
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/clients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.nom}</h1>
            <p className="text-muted-foreground">
              Fiche client détaillée
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      <ClientInfoCard client={client} />
      <ClientFinancialStats client={client} />
      <ClientDocumentsTabs clientId={client.id} />

      <ClientFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={client}
      />
    </div>
  );
}
