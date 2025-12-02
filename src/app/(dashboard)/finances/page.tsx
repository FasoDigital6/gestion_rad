"use client";

import { useState } from "react";
import {
  useEtatFinancier,
  useDepensesParCategorie,
  useIndicateursFinanciers,
} from "@/lib/hooks/use-finances";
import { useAuth } from "@/lib/firebase/auth/auth-context";
import { FinancialOverviewCard } from "@/components/finances/financial-overview-card";
import { CycleStatusCard } from "@/components/finances/cycle-status-card";
import { DepensesSummaryCard } from "@/components/finances/depenses-summary-card";
import { IndicateursCard } from "@/components/finances/indicateurs-card";
import { PeriodeFilter } from "@/components/finances/periode-filter";
import { DepenseFormSheet } from "@/components/depense/depense-form-sheet";
import { Loader2, Package, FileText, CheckCircle, XCircle, Truck, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FiltrePeriode } from "@/lib/types/finances";

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function getPeriodeLabel(periode: FiltrePeriode): string {
  if (periode.type === "mois" && periode.mois) {
    return `${MOIS_LABELS[periode.mois - 1]} ${periode.annee}`;
  } else if (periode.type === "annee") {
    return `Année ${periode.annee}`;
  } else if (periode.type === "custom" && periode.dateDebut && periode.dateFin) {
    const debut = new Date(periode.dateDebut);
    const fin = new Date(periode.dateFin);
    return `Du ${debut.toLocaleDateString("fr-FR")} au ${fin.toLocaleDateString("fr-FR")}`;
  }
  return "Toutes périodes";
}

export default function FinancesPage() {
  const auth = useAuth();

  // Période par défaut : année courante
  const [periode, setPeriode] = useState<FiltrePeriode>({
    type: "annee",
    annee: new Date().getFullYear(),
  });

  // État pour le modal de dépense
  const [isDepenseFormOpen, setIsDepenseFormOpen] = useState(false);

  const { data: etatFinancier, isLoading: isLoadingEtat } = useEtatFinancier(periode);
  const { data: depensesParCategorie = [], isLoading: isLoadingDepenses } =
    useDepensesParCategorie();
  const { data: indicateurs, isLoading: isLoadingIndicateurs } =
    useIndicateursFinanciers(periode);

  if (isLoadingEtat || isLoadingDepenses || isLoadingIndicateurs) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!etatFinancier || !indicateurs) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">
          Impossible de charger les données financières
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finances</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de la situation financière
          </p>
        </div>
        <Button
          onClick={() => setIsDepenseFormOpen(true)}
          className="bg-brand hover:bg-brand/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une dépense
        </Button>
      </div>

      {/* Synthèse financière globale */}
      <FinancialOverviewCard
        recettes={etatFinancier.recettes}
        depenses={etatFinancier.totalDepenses}
        resultatNet={etatFinancier.resultatNet}
      />

      {/* Cycle commercial */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cycle commercial</h2>
          <span className="text-sm text-muted-foreground">
            {getPeriodeLabel(periode)}
          </span>
        </div>

        {/* Filtre de période */}
        <PeriodeFilter periode={periode} onChange={setPeriode} />

        {/* Indicateurs du cycle commercial */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {/* Total livré */}
          <IndicateursCard
            title="Total livré (BDL)"
            montant={indicateurs.totalLivre}
            count={indicateurs.totalLivreCount}
            icon={Truck}
            color="purple"
            href="/bdl"
          />

          {/* Total facturé */}
          <IndicateursCard
            title="Total facturé"
            montant={indicateurs.totalFacture}
            count={indicateurs.totalFactureCount}
            icon={FileText}
            color="teal"
            href="/factures"
          />

          {/* Livré facturé */}
          <IndicateursCard
            title="Livré facturé"
            montant={indicateurs.livreFacture}
            count={indicateurs.livreFactureCount}
            icon={FileCheck}
            color="blue"
          />

          {/* Livré non facturé */}
          <CycleStatusCard
            title="Livré non facturé"
            montant={etatFinancier.livreMontant}
            count={etatFinancier.livreCount}
            icon={Package}
            color="blue"
            href="/bdl"
          />

          {/* Payé */}
          <CycleStatusCard
            title="Payé"
            montant={etatFinancier.payeMontant}
            count={etatFinancier.payeCount}
            icon={CheckCircle}
            color="green"
            href="/factures"
          />

          {/* Annulé */}
          <CycleStatusCard
            title="Annulé"
            montant={etatFinancier.annuleMontant}
            count={etatFinancier.annuleCount}
            icon={XCircle}
            color="red"
          />
        </div>
      </div>

      {/* Dépenses par catégorie */}
      <div className="grid gap-4 md:grid-cols-2">
        <DepensesSummaryCard
          depensesParCategorie={depensesParCategorie}
          totalDepenses={etatFinancier.totalDepenses}
        />

        {/* Placeholder pour graphiques futurs */}
        <div className="bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Graphique d'évolution
            <br />
            <span className="text-xs">(à venir)</span>
          </p>
        </div>
      </div>

      {/* Modal d'ajout de dépense */}
      <DepenseFormSheet
        open={isDepenseFormOpen}
        onOpenChange={setIsDepenseFormOpen}
        depense={null}
        userId={auth?.uid}
        userName={auth?.displayName || undefined}
      />
    </div>
  );
}
