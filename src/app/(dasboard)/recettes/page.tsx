"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFactures } from "@/lib/hooks/use-factures";
import { usePaiements } from "@/lib/hooks/use-paiements";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function RecettesPage() {
  const { data: factures } = useFactures();
  const { data: paiements } = usePaiements();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculs
  const totalFacture = factures?.reduce((sum, f) => sum + f.totalTTC, 0) || 0;
  const totalPaye = paiements?.reduce((sum, p) => sum + p.montant, 0) || 0;
  const totalRestant = factures?.reduce((sum, f) => sum + f.montantRestant, 0) || 0;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recettes</h1>
        <p className="text-muted-foreground">
          Paiements reçus et à recevoir
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Facturé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFacture)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Payé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaye)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">À Recevoir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalRestant)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Derniers paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {!paiements || paiements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun paiement enregistré
            </p>
          ) : (
            <div className="space-y-4">
              {paiements.slice(0, 10).map((paiement) => (
                <div
                  key={paiement.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{paiement.numero}</p>
                      <Badge variant="outline">{paiement.modePaiement}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {paiement.clientNom} • Facture {paiement.factureNumero}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(paiement.datePaiement, "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(paiement.montant)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
