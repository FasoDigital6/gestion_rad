"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { formatMontant } from "@/lib/utils/dashboard";
import type { FinancialKPIs } from "@/lib/hooks/use-dashboard-stats";

interface PaymentHealthCardProps {
  financialKPIs: FinancialKPIs;
  overdueInvoicesCount: number;
  overdueAmount: number;
}

export function PaymentHealthCard({
  financialKPIs,
  overdueInvoicesCount,
  overdueAmount,
}: PaymentHealthCardProps) {
  const paymentRate =
    financialKPIs.totalFacture > 0
      ? (financialKPIs.totalPaye / financialKPIs.totalFacture) * 100
      : 0;

  const getHealthColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getHealthIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rate >= 70) return <Clock className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Santé des paiements</CardTitle>
        <CardDescription>État général des encaissements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Taux de paiement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getHealthIcon(paymentRate)}
              <span className="text-sm font-medium">Taux de paiement global</span>
            </div>
            <span className={`text-2xl font-bold ${getHealthColor(paymentRate)}`}>
              {paymentRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={paymentRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatMontant(financialKPIs.totalPaye)} payé sur{" "}
            {formatMontant(financialKPIs.totalFacture)} facturé
          </p>
        </div>

        {/* Montant restant dû */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Montant total dû</p>
            <p className="text-xl font-bold text-foreground">
              {formatMontant(financialKPIs.totalDu)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Factures en retard */}
        {overdueInvoicesCount > 0 && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200">
            <div>
              <p className="text-sm font-medium text-red-900">
                Factures en retard
              </p>
              <p className="text-xs text-red-700 mt-1">
                {overdueInvoicesCount} facture{overdueInvoicesCount > 1 ? "s" : ""} •{" "}
                {formatMontant(overdueAmount)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        )}

        {/* Indicateur vert si tout va bien */}
        {overdueInvoicesCount === 0 && paymentRate >= 90 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-900 font-medium">
              Excellent ! Aucune facture en retard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
