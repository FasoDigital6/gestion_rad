"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RiFileTextLine,
  RiTruckLine,
  RiFileList2Line,
  RiWalletLine,
} from "react-icons/ri";
import { useProformas } from "@/lib/hooks/use-proformas";
import { useBDCs } from "@/lib/hooks/use-bdc";
import { useBLs } from "@/lib/hooks/use-bl";
import { useFactures } from "@/lib/hooks/use-factures";

export default function DashboardPage() {
  const { data: proformas } = useProformas();
  const { data: bdcs } = useBDCs();
  const { data: bls } = useBLs();
  const { data: factures } = useFactures();

  // Calculs des statistiques
  const totalLivre = bls?.reduce((sum, bl) => sum + bl.totalTTC, 0) || 0;
  const totalFacture = factures?.reduce((sum, f) => sum + f.totalTTC, 0) || 0;
  const totalPaye = factures?.reduce((sum, f) => sum + f.montantPaye, 0) || 0;
  const totalDu = factures?.reduce((sum, f) => sum + f.montantRestant, 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Proformas en cours",
      value: proformas?.filter((p) => p.statut === "envoye").length || 0,
      icon: RiFileTextLine,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Livré (Non facturé)",
      value: formatCurrency(totalLivre - totalFacture),
      icon: RiTruckLine,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Facturé (Non payé)",
      value: formatCurrency(totalDu),
      icon: RiFileList2Line,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Payé",
      value: formatCurrency(totalPaye),
      icon: RiWalletLine,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Factures en retard
  const facturesEnRetard =
    factures?.filter((f) => {
      return f.montantRestant > 0 && new Date() > f.dateEcheance;
    }) || [];

  // BDC en cours
  const bdcsEnCours = bdcs?.filter((bdc) => bdc.statut === "en_cours") || [];

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertes et notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Factures en retard</CardTitle>
          </CardHeader>
          <CardContent>
            {facturesEnRetard.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune facture en retard
              </p>
            ) : (
              <div className="space-y-2">
                {facturesEnRetard.slice(0, 5).map((facture) => (
                  <div
                    key={facture.id}
                    className="flex items-center justify-between border-l-4 border-red-500 pl-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{facture.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {facture.clientNom}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {formatCurrency(facture.montantRestant)}
                      </p>
                    </div>
                  </div>
                ))}
                {facturesEnRetard.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{facturesEnRetard.length - 5} autre(s) facture(s) en
                    retard
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {bdcsEnCours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune commande en cours
              </p>
            ) : (
              <div className="space-y-2">
                {bdcsEnCours.slice(0, 5).map((bdc) => {
                  const progression =
                    bdc.quantiteCommandee > 0
                      ? Math.round(
                          (bdc.quantiteLivree / bdc.quantiteCommandee) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={bdc.id}
                      className="flex items-center justify-between border-l-4 border-yellow-500 pl-3 py-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{bdc.numero}</p>
                        <p className="text-sm text-muted-foreground">
                          {bdc.clientNom}
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${progression}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium">{progression}%</p>
                      </div>
                    </div>
                  );
                })}
                {bdcsEnCours.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{bdcsEnCours.length - 5} autre(s) commande(s) en cours
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Résumé des documents */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {proformas?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Proformas</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {bdcs?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">BDC</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-orange-600">
                {bls?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">BL</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {factures?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Factures</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
