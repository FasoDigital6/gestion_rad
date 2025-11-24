"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DepensesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground">
            Dépenses et factures fournisseurs
          </p>
        </div>
        <Button>
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
            <div className="text-2xl font-bold">0 FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cette année</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 FCFA</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune dépense enregistrée
            </p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une dépense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
