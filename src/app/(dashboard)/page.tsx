"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { formatMontant } from "@/lib/utils/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DocumentCounterCard } from "@/components/dashboard/document-counter-card";
import { FinancialBarChart } from "@/components/dashboard/financial-bar-chart";
import { InvoicesDonutChart } from "@/components/dashboard/invoices-donut-chart";
import { ConversionPipelineChart } from "@/components/dashboard/conversion-pipeline-chart";
import { PaymentHealthCard } from "@/components/dashboard/payment-health-card";
import { ActionItemsList } from "@/components/dashboard/action-items-list";
import { RecentClientsTable } from "@/components/dashboard/recent-clients-table";
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TrendingUp, Receipt, DollarSign, AlertCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientFormSheet } from "@/components/clients/client-form-sheet";
import { ProformaFormSheet } from "@/components/proformas/proforma-form-sheet";
import { BdcFormSheet } from "@/components/bdc/bdc-form-sheet";
import { BdlFormSheet } from "@/components/bdl/bdl-form-sheet";
import { FactureFormSheet } from "@/components/facture/facture-form-sheet";

export default function DashboardPage() {
  const {
    financialKPIs,
    documentCounts,
    conversionRates,
    actionItems,
    recentData,
    isLoading,
    isError,
  } = useDashboardStats();

  const router = useRouter();

  // États pour gérer l'ouverture des modals
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isProformaFormOpen, setIsProformaFormOpen] = useState(false);
  const [isBdcFormOpen, setIsBdcFormOpen] = useState(false);
  const [isBdlFormOpen, setIsBdlFormOpen] = useState(false);
  const [isFactureFormOpen, setIsFactureFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground">
            Chargement de vos données...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-muted animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-base text-destructive">
            Erreur lors du chargement des données. Veuillez réessayer.
          </p>
        </div>
      </div>
    );
  }

  // Calculer factures en retard pour PaymentHealthCard
  const overdueInvoices = actionItems.filter(
    (action) => action.type === "facture-retard"
  );
  const overdueAmount = overdueInvoices.reduce((sum, action) => {
    const montantMeta = action.metadata.find((m) => m.label === "Montant dû");
    if (montantMeta) {
      // Extraire le montant du format "123 456 GNF"
      const montant = parseFloat(
        montantMeta.value.replace(/[^\d]/g, "")
      );
      return sum + (isNaN(montant) ? 0 : montant);
    }
    return sum;
  }, 0);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">
            Vue d'ensemble de votre activité commerciale
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Actions rapides
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setIsClientFormOpen(true)}>
              Nouveau client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsProformaFormOpen(true)}>
              Nouvelle proforma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsBdcFormOpen(true)}>
              Nouveau bon de commande
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsBdlFormOpen(true)}>
              Nouveau bon de livraison
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsFactureFormOpen(true)}>
              Nouvelle facture
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section 1: KPI Financiers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Indicateurs financiers</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total livré"
            value={formatMontant(financialKPIs.totalLivre)}
            icon={TrendingUp}
            color="blue"
          />
          <StatsCard
            title="Total facturé"
            value={formatMontant(financialKPIs.totalFacture)}
            icon={Receipt}
            color="purple"
          />
          <StatsCard
            title="Total payé"
            value={formatMontant(financialKPIs.totalPaye)}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Total dû"
            value={formatMontant(financialKPIs.totalDu)}
            icon={AlertCircle}
            color="red"
          />
        </div>
        <FinancialBarChart data={financialKPIs} />
      </div>

      {/* Section 2: Compteurs Documents + Graphique Donut */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
            <DocumentCounterCard
              type="proforma"
              total={documentCounts.proformas.total}
              breakdown={[
                {
                  statut: "BROUILLON",
                  count: documentCounts.proformas.parStatut.BROUILLON || 0,
                  color: "bg-gray-100 text-gray-800",
                },
                {
                  statut: "ENVOYE",
                  count: documentCounts.proformas.parStatut.ENVOYE || 0,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  statut: "VALIDE",
                  count: documentCounts.proformas.parStatut.VALIDE || 0,
                  color: "bg-green-100 text-green-800",
                },
              ]}
            />
            <DocumentCounterCard
              type="bdc"
              total={documentCounts.bdcs.total}
              breakdown={[
                {
                  statut: "BROUILLON",
                  count: documentCounts.bdcs.parStatut.BROUILLON || 0,
                  color: "bg-gray-100 text-gray-800",
                },
                {
                  statut: "ENVOYE",
                  count: documentCounts.bdcs.parStatut.ENVOYE || 0,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  statut: "APPROUVE",
                  count: documentCounts.bdcs.parStatut.APPROUVE || 0,
                  color: "bg-green-100 text-green-800",
                },
              ]}
            />
            <DocumentCounterCard
              type="bdl"
              total={documentCounts.bdls.total}
              breakdown={[
                {
                  statut: "BROUILLON",
                  count: documentCounts.bdls.parStatut.BROUILLON || 0,
                  color: "bg-gray-100 text-gray-800",
                },
                {
                  statut: "EN_ROUTE",
                  count: documentCounts.bdls.parStatut.EN_ROUTE || 0,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  statut: "LIVRE",
                  count: documentCounts.bdls.parStatut.LIVRE || 0,
                  color: "bg-green-100 text-green-800",
                },
              ]}
            />
            <DocumentCounterCard
              type="facture"
              total={documentCounts.factures.total}
              breakdown={[
                {
                  statut: "BROUILLON",
                  count: documentCounts.factures.parStatut.BROUILLON || 0,
                  color: "bg-gray-100 text-gray-800",
                },
                {
                  statut: "EMISE",
                  count: documentCounts.factures.parStatut.EMISE || 0,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  statut: "PAYEE",
                  count: documentCounts.factures.parStatut.PAYEE || 0,
                  color: "bg-green-100 text-green-800",
                },
              ]}
            />
          </div>
          <div className="lg:col-span-1">
            <InvoicesDonutChart data={documentCounts.factures} />
          </div>
        </div>
      </div>

      {/* Section 3: Indicateurs Performance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Performance</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ConversionPipelineChart data={conversionRates} />
          <PaymentHealthCard
            financialKPIs={financialKPIs}
            overdueInvoicesCount={overdueInvoices.length}
            overdueAmount={overdueAmount}
          />
        </div>
      </div>

      {/* Section 4: Actions Requises */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">À faire</h2>
        <ActionItemsList actions={actionItems} />
      </div>

      {/* Section 5: Activité Récente */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Activité récente</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentClientsTable clients={recentData.clients} />
          <RecentInvoicesTable factures={recentData.factures} />
        </div>
      </div>

      {/* Modals de création */}
      <ClientFormSheet
        open={isClientFormOpen}
        onOpenChange={setIsClientFormOpen}
        client={null}
        onClientCreated={(clientId) => {
          toast.success("Client créé avec succès", {
            action: {
              label: "Voir détails",
              onClick: () => router.push(`/clients/${clientId}`),
            },
          });
        }}
      />

      <ProformaFormSheet
        open={isProformaFormOpen}
        onOpenChange={setIsProformaFormOpen}
        proforma={null}
        onProformaCreated={(proformaId) => {
          toast.success("Proforma créée avec succès", {
            action: {
              label: "Voir détails",
              onClick: () => router.push(`/proformas/${proformaId}`),
            },
          });
        }}
      />

      <BdcFormSheet
        open={isBdcFormOpen}
        onOpenChange={setIsBdcFormOpen}
        bdc={null}
        onBdcCreated={(bdcId) => {
          toast.success("Bon de commande créé avec succès", {
            action: {
              label: "Voir détails",
              onClick: () => router.push(`/bdc/${bdcId}`),
            },
          });
        }}
      />

      {/* BdlFormSheet nécessite un BDC existant, ne peut pas être créé depuis le dashboard */}
      {/* <BdlFormSheet
        open={isBdlFormOpen}
        onOpenChange={setIsBdlFormOpen}
        bdc={null}
      /> */}

      <FactureFormSheet
        open={isFactureFormOpen}
        onOpenChange={setIsFactureFormOpen}
        mode="manual"
        facture={null}
        onFactureCreated={(factureId) => {
          toast.success("Facture créée avec succès", {
            action: {
              label: "Voir détails",
              onClick: () => router.push(`/factures/${factureId}`),
            },
          });
        }}
      />
    </div>
  );
}
