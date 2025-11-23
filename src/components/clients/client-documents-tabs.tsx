"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ShoppingCart, Truck, Receipt, DollarSign } from "lucide-react";

interface ClientDocumentsTabsProps {
  clientId: string;
}

export function ClientDocumentsTabs({ clientId }: ClientDocumentsTabsProps) {
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
              Proformas
            </TabsTrigger>
            <TabsTrigger value="bdc" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              BDC
            </TabsTrigger>
            <TabsTrigger value="bl" className="gap-2">
              <Truck className="h-4 w-4" />
              BL
            </TabsTrigger>
            <TabsTrigger value="factures" className="gap-2">
              <Receipt className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="paiements" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Paiements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proformas" className="mt-6">
            <EmptyState
              icon={FileText}
              title="Aucun proforma"
              description="Les proformas associés à ce client apparaîtront ici."
            />
          </TabsContent>

          <TabsContent value="bdc" className="mt-6">
            <EmptyState
              icon={ShoppingCart}
              title="Aucun bon de commande"
              description="Les bons de commande associés à ce client apparaîtront ici."
            />
          </TabsContent>

          <TabsContent value="bl" className="mt-6">
            <EmptyState
              icon={Truck}
              title="Aucun bon de livraison"
              description="Les bons de livraison associés à ce client apparaîtront ici."
            />
          </TabsContent>

          <TabsContent value="factures" className="mt-6">
            <EmptyState
              icon={Receipt}
              title="Aucune facture"
              description="Les factures associées à ce client apparaîtront ici."
            />
          </TabsContent>

          <TabsContent value="paiements" className="mt-6">
            <EmptyState
              icon={DollarSign}
              title="Aucun paiement"
              description="Les paiements effectués par ce client apparaîtront ici."
            />
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