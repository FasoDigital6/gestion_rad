"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFactures } from "@/lib/hooks/use-factures";
import { useBLs } from "@/lib/hooks/use-bl";

export default function RapportsPage() {
  const { data: factures } = useFactures();
  const { data: bls } = useBLs();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculs
  const totalLivre = bls?.reduce((sum, bl) => sum + bl.totalTTC, 0) || 0;
  const totalFacture = factures?.reduce((sum, f) => sum + f.totalTTC, 0) || 0;
  const totalPaye = factures?.reduce((sum, f) => sum + f.montantPaye, 0) || 0;
  const totalDepenses = 0; // À implémenter avec les dépenses
  const resultatNet = totalPaye - totalDepenses;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports Financiers</h1>
        <p className="text-muted-foreground">
          Résumé de l'activité commerciale et financière
        </p>
      </div>

      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Total Livré</span>
              <span className="text-lg font-bold">{formatCurrency(totalLivre)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Total Facturé</span>
              <span className="text-lg font-bold">{formatCurrency(totalFacture)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Total Payé (Recettes)</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(totalPaye)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Total Dépenses</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(totalDepenses)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold">Résultat Net</span>
              <span
                className={`text-2xl font-bold ${
                  resultatNet >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(resultatNet)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques par statut */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Livré - Non Facturé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalLivre - totalFacture)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En attente de facturation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Facturé - Non Payé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalFacture - totalPaye)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En attente de paiement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taux de recouvrement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalFacture > 0
                ? Math.round((totalPaye / totalFacture) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Du montant facturé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informations additionnelles */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Bons de Livraison</span>
                <span className="font-medium">{bls?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Factures</span>
                <span className="font-medium">{factures?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Factures payées</span>
                <span className="font-medium text-green-600">
                  {factures?.filter((f) => f.statut === "payee").length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Factures en retard</span>
                <span className="font-medium text-red-600">
                  {factures?.filter(
                    (f) =>
                      f.montantRestant > 0 && new Date() > f.dateEcheance
                  ).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Montant moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Par facture</span>
                <span className="font-medium">
                  {formatCurrency(
                    factures && factures.length > 0
                      ? totalFacture / factures.length
                      : 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Par livraison</span>
                <span className="font-medium">
                  {formatCurrency(
                    bls && bls.length > 0 ? totalLivre / bls.length : 0
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
