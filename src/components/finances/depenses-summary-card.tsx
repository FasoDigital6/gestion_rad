"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMontant } from "@/lib/utils/facture";
import { CATEGORIE_DEPENSE_LABELS } from "@/lib/types/depense";
import type { DepenseParCategorie } from "@/lib/types/finances";
import { Receipt } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DepensesSummaryCardProps {
  depensesParCategorie: DepenseParCategorie[];
  totalDepenses: number;
}

export function DepensesSummaryCard({
  depensesParCategorie,
  totalDepenses,
}: DepensesSummaryCardProps) {
  // Afficher uniquement les catégories avec des dépenses (top 5)
  const topCategories = depensesParCategorie.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand" />
          Dépenses par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune dépense enregistrée
          </p>
        ) : (
          <div className="space-y-4">
            {topCategories.map((cat) => (
              <div key={cat.categorie} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {CATEGORIE_DEPENSE_LABELS[cat.categorie]}
                  </span>
                  <span className="text-muted-foreground">
                    {cat.pourcentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={cat.pourcentage} className="flex-1" />
                  <span className="text-sm font-semibold min-w-[120px] text-right">
                    {formatMontant(cat.montant)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {cat.count} {cat.count > 1 ? "dépenses" : "dépense"}
                </p>
              </div>
            ))}
            {depensesParCategorie.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                + {depensesParCategorie.length - 5} autres catégories
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
