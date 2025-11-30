"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatMontant } from "@/lib/utils/facture";
import type { Facture } from "@/lib/types/facture";

interface PaiementSummaryCardProps {
  facture: Facture;
  onAddPaiement?: () => void;
}

export function PaiementSummaryCard({
  facture,
  onAddPaiement,
}: PaiementSummaryCardProps) {
  const pourcentagePaye =
    facture.totalNet > 0 ? (facture.totalPaye / facture.totalNet) * 100 : 0;

  const canAddPaiement =
    (facture.statut === "EMISE" || facture.statut === "PAYEE_PARTIELLE") &&
    facture.soldeRestant > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          Résumé des paiements
        </CardTitle>
        {canAddPaiement && onAddPaiement && (
          <Button
            onClick={onAddPaiement}
            size="sm"
            className="bg-brand hover:bg-brand/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un paiement
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Montants */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatMontant(facture.totalNet)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total payé</p>
            <p className="text-2xl font-bold text-green-600">
              {formatMontant(facture.totalPaye)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Solde restant</p>
            <p
              className={`text-2xl font-bold ${
                facture.soldeRestant > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatMontant(facture.soldeRestant)}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progression</span>
            <span className="font-medium text-gray-900">
              {pourcentagePaye.toFixed(1)}%
            </span>
          </div>
          <Progress value={pourcentagePaye} className="h-2" />
        </div>

        {/* Statut */}
        {facture.statut === "PAYEE" && (
          <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              ✓ Facture payée intégralement
            </p>
          </div>
        )}

        {facture.statut === "PAYEE_PARTIELLE" && (
          <div className="flex items-center justify-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-800">
              ⚠ Paiement partiel - Solde restant:{" "}
              {formatMontant(facture.soldeRestant)}
            </p>
          </div>
        )}

        {facture.statut === "EMISE" && facture.totalPaye === 0 && (
          <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              ℹ Aucun paiement reçu
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
