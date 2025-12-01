"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMontant, formatDate } from "@/lib/utils/dashboard";
import { useRouter } from "next/navigation";
import { getFactureStatusLabel, getFactureStatusStyle } from "@/lib/utils/facture";
import type { Facture } from "@/lib/types/facture";
import { FileText } from "lucide-react";

interface RecentInvoicesTableProps {
  factures: Facture[];
}

export function RecentInvoicesTable({ factures }: RecentInvoicesTableProps) {
  const router = useRouter();

  if (factures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription>Les 5 dernières factures émises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune facture émise</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription className="mt-1">Les 5 dernières factures émises</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push("/factures")}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {factures.map((facture) => (
                <tr
                  key={facture.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/factures/${facture.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{facture.numero}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{facture.clientNom}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(facture.dateEmission)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {formatMontant(facture.totalNet)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={getFactureStatusStyle(facture.statut)}>
                      {getFactureStatusLabel(facture.statut)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
