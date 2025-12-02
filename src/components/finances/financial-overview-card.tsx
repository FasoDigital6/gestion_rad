"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMontant } from "@/lib/utils/facture";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialOverviewCardProps {
  recettes: number;
  depenses: number;
  resultatNet: number;
}

export function FinancialOverviewCard({
  recettes,
  depenses,
  resultatNet,
}: FinancialOverviewCardProps) {
  const isPositive = resultatNet >= 0;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-brand" />
          Synthèse financière
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Recettes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Recettes (montants payés)
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600">
                {formatMontant(recettes)}
              </p>
            </div>
          </div>

          {/* Dépenses */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Dépenses totales
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-red-600">
                {formatMontant(depenses)}
              </p>
            </div>
          </div>

          {/* Résultat net */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Résultat net
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl font-bold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatMontant(resultatNet)}
              </p>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
