"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useDepenses, useStatistiquesDepenses } from "@/lib/hooks/use-depenses";
import { DepenseFormSheet } from "@/components/depenses/depense-form-sheet";
import { useAuth } from "@/lib/context/auth-context";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DepensesPage() {
  const { data: depenses, isLoading } = useDepenses();
  const { data: stats } = useStatistiquesDepenses();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddDepense = () => {
    setIsFormOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categorieLabels: Record<string, string> = {
    fournitures: "Fournitures",
    transport: "Transport",
    salaires: "Salaires",
    loyer: "Loyer",
    electricite: "Électricité",
    eau: "Eau",
    internet: "Internet",
    telephonie: "Téléphonie",
    maintenance: "Maintenance",
    formation: "Formation",
    autre: "Autre",
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground">
            Dépenses et factures fournisseurs
          </p>
        </div>
        <Button onClick={handleAddDepense}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.depensesCeMois || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cette année</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.depensesCetteAnnee || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalDepenses || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dépenses par catégorie */}
      {stats && stats.parCategorie.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.parCategorie
                .sort((a, b) => b.montant - a.montant)
                .slice(0, 5)
                .map((cat) => (
                  <div key={cat.categorie} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {categorieLabels[cat.categorie]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({cat.pourcentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${cat.pourcentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="font-medium">{formatCurrency(cat.montant)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : !depenses || depenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucune dépense enregistrée
              </p>
              <Button variant="outline" onClick={handleAddDepense}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une dépense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {depenses.slice(0, 10).map((depense) => (
                <div
                  key={depense.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{depense.designation}</p>
                      <Badge variant="outline">
                        {categorieLabels[depense.categorie]}
                      </Badge>
                    </div>
                    {depense.fournisseur && (
                      <p className="text-sm text-muted-foreground">
                        {depense.fournisseur}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(depense.dateDepense, "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(depense.montant)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DepenseFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userId={user?.uid || ""}
      />
    </div>
  );
}
