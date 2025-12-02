"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ShoppingCart, Truck, Receipt, DollarSign, ExternalLink } from "lucide-react";
import { useProformasByClient } from "@/lib/hooks/use-proformas";
import { useBdcsByClient } from "@/lib/hooks/use-bdc";
import { useBdlsByClient } from "@/lib/hooks/use-bdl";
import { useFacturesByClient } from "@/lib/hooks/use-facture";
import { usePaiementsByClient } from "@/lib/hooks/use-paiement";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { formatMontant } from "@/lib/utils/facture";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { Proforma } from "@/lib/types/proforma";
import type { Bdc } from "@/lib/types/bdc";
import type { Bdl } from "@/lib/types/bdl";
import type { Facture } from "@/lib/types/facture";
import type { Paiement } from "@/lib/types/paiement";

interface ClientDocumentsTabsProps {
  clientId: string;
}

export function ClientDocumentsTabs({ clientId }: ClientDocumentsTabsProps) {
  const { data: proformas = [], isLoading: isLoadingProformas } = useProformasByClient(clientId);
  const { data: bdcs = [], isLoading: isLoadingBdcs } = useBdcsByClient(clientId);
  const { data: bdls = [], isLoading: isLoadingBdls } = useBdlsByClient(clientId);
  const { data: factures = [], isLoading: isLoadingFactures } = useFacturesByClient(clientId);
  const { data: paiements = [], isLoading: isLoadingPaiements } = usePaiementsByClient(clientId);

  // Colonnes Proformas
  const proformasColumns: ColumnDef<Proforma>[] = [
    {
      accessorKey: "numero",
      header: "N°",
      cell: ({ row }) => (
        <Link
          href={`/proformas/${row.original.id}`}
          className="font-mono text-sm hover:underline"
        >
          {row.getValue("numero")}
        </Link>
      ),
    },
    {
      accessorKey: "dateCreation",
      header: "Date",
      cell: ({ row }) => (
        <Link
          href={`/proformas/${row.original.id}`}
          className="hover:underline"
        >
          {format(row.getValue("dateCreation"), "dd/MM/yyyy", { locale: fr })}
        </Link>
      ),
    },
    {
      accessorKey: "totalNet",
      header: "Montant",
      cell: ({ row }) => (
        <Link
          href={`/proformas/${row.original.id}`}
          className="hover:underline"
        >
          {formatMontant(row.getValue("totalNet"))}
        </Link>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <Link
          href={`/proformas/${row.original.id}`}
          className="inline-block"
        >
          <Badge variant={row.getValue("statut") === "VALIDE" ? "default" : "secondary"}>
            {row.getValue("statut")}
          </Badge>
        </Link>
      ),
    },
  ];

  // Colonnes BDC
  const bdcColumns: ColumnDef<Bdc>[] = [
    {
      accessorKey: "numero",
      header: "N°",
      cell: ({ row }) => (
        <Link
          href={`/bdc/${row.original.id}`}
          className="font-mono text-sm hover:underline"
        >
          {row.getValue("numero")}
        </Link>
      ),
    },
    {
      accessorKey: "dateCreation",
      header: "Date",
      cell: ({ row }) => (
        <Link
          href={`/bdc/${row.original.id}`}
          className="hover:underline"
        >
          {format(row.getValue("dateCreation"), "dd/MM/yyyy", { locale: fr })}
        </Link>
      ),
    },
    {
      accessorKey: "totalNet",
      header: "Montant",
      cell: ({ row }) => (
        <Link
          href={`/bdc/${row.original.id}`}
          className="hover:underline"
        >
          {formatMontant(row.getValue("totalNet"))}
        </Link>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <Link
          href={`/bdc/${row.original.id}`}
          className="inline-block"
        >
          <Badge variant={row.getValue("statut") === "APPROUVE" ? "default" : "secondary"}>
            {row.getValue("statut")}
          </Badge>
        </Link>
      ),
    },
  ];

  // Colonnes BDL
  const bdlColumns: ColumnDef<Bdl>[] = [
    {
      accessorKey: "numero",
      header: "N°",
      cell: ({ row }) => (
        <Link
          href={`/bdl/${row.original.id}`}
          className="font-mono text-sm hover:underline"
        >
          {row.getValue("numero")}
        </Link>
      ),
    },
    {
      accessorKey: "dateLivraison",
      header: "Date livraison",
      cell: ({ row }) => (
        <Link
          href={`/bdl/${row.original.id}`}
          className="hover:underline"
        >
          {format(row.getValue("dateLivraison"), "dd/MM/yyyy", { locale: fr })}
        </Link>
      ),
    },
    {
      accessorKey: "totalNet",
      header: "Montant",
      cell: ({ row }) => (
        <Link
          href={`/bdl/${row.original.id}`}
          className="hover:underline"
        >
          {formatMontant(row.getValue("totalNet"))}
        </Link>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <Link
          href={`/bdl/${row.original.id}`}
          className="inline-block"
        >
          <Badge variant={row.getValue("statut") === "LIVRE" ? "default" : "secondary"}>
            {row.getValue("statut")}
          </Badge>
        </Link>
      ),
    },
  ];

  // Colonnes Factures
  const facturesColumns: ColumnDef<Facture>[] = [
    {
      accessorKey: "numero",
      header: "N°",
      cell: ({ row }) => (
        <Link
          href={`/factures/${row.original.id}`}
          className="font-mono text-sm hover:underline"
        >
          {row.getValue("numero")}
        </Link>
      ),
    },
    {
      accessorKey: "dateEmission",
      header: "Date émission",
      cell: ({ row }) => (
        <Link
          href={`/factures/${row.original.id}`}
          className="hover:underline"
        >
          {format(row.getValue("dateEmission"), "dd/MM/yyyy", { locale: fr })}
        </Link>
      ),
    },
    {
      accessorKey: "totalNet",
      header: "Montant",
      cell: ({ row }) => (
        <Link
          href={`/factures/${row.original.id}`}
          className="hover:underline"
        >
          {formatMontant(row.getValue("totalNet"))}
        </Link>
      ),
    },
    {
      accessorKey: "soldeRestant",
      header: "Reste dû",
      cell: ({ row }) => (
        <Link
          href={`/factures/${row.original.id}`}
          className="hover:underline"
        >
          {formatMontant(row.getValue("soldeRestant"))}
        </Link>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.getValue("statut") as string;
        const variant = statut === "PAYEE" ? "default" : statut === "EMISE" ? "secondary" : "outline";
        return (
          <Link
            href={`/factures/${row.original.id}`}
            className="inline-block"
          >
            <Badge variant={variant}>{statut}</Badge>
          </Link>
        );
      },
    },
  ];

  // Colonnes Paiements
  const paiementsColumns: ColumnDef<Paiement>[] = [
    {
      accessorKey: "factureNumero",
      header: "Facture",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("factureNumero")}</span>
      ),
    },
    {
      accessorKey: "datePaiement",
      header: "Date paiement",
      cell: ({ row }) => format(row.getValue("datePaiement"), "dd/MM/yyyy", { locale: fr }),
    },
    {
      accessorKey: "montant",
      header: "Montant",
      cell: ({ row }) => formatMontant(row.getValue("montant")),
    },
    {
      accessorKey: "modePaiement",
      header: "Mode",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("modePaiement")}</Badge>
      ),
    },
    {
      accessorKey: "referencePaiement",
      header: "Référence",
      cell: ({ row }) => row.getValue("referencePaiement") || "-",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents et historique</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="proformas" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="proformas" className="gap-2">
              <FileText className="h-4 w-4" />
              Proformas ({proformas.length})
            </TabsTrigger>
            <TabsTrigger value="bdc" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              BDC ({bdcs.length})
            </TabsTrigger>
            <TabsTrigger value="bl" className="gap-2">
              <Truck className="h-4 w-4" />
              BL ({bdls.length})
            </TabsTrigger>
            <TabsTrigger value="factures" className="gap-2">
              <Receipt className="h-4 w-4" />
              Factures ({factures.length})
            </TabsTrigger>
            <TabsTrigger value="paiements" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Paiements ({paiements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proformas" className="mt-6">
            {isLoadingProformas ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : proformas.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun proforma"
                description="Les proformas associés à ce client apparaîtront ici."
              />
            ) : (
              <DataTable columns={proformasColumns} data={proformas} />
            )}
          </TabsContent>

          <TabsContent value="bdc" className="mt-6">
            {isLoadingBdcs ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : bdcs.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Aucun bon de commande"
                description="Les bons de commande associés à ce client apparaîtront ici."
              />
            ) : (
              <DataTable columns={bdcColumns} data={bdcs} />
            )}
          </TabsContent>

          <TabsContent value="bl" className="mt-6">
            {isLoadingBdls ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : bdls.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Aucun bon de livraison"
                description="Les bons de livraison associés à ce client apparaîtront ici."
              />
            ) : (
              <DataTable columns={bdlColumns} data={bdls} />
            )}
          </TabsContent>

          <TabsContent value="factures" className="mt-6">
            {isLoadingFactures ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : factures.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Aucune facture"
                description="Les factures associées à ce client apparaîtront ici."
              />
            ) : (
              <DataTable columns={facturesColumns} data={factures} />
            )}
          </TabsContent>

          <TabsContent value="paiements" className="mt-6">
            {isLoadingPaiements ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : paiements.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="Aucun paiement"
                description="Les paiements effectués par ce client apparaîtront ici."
              />
            ) : (
              <DataTable columns={paiementsColumns} data={paiements} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}