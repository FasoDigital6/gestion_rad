"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMontant, formatDate } from "@/lib/utils/dashboard";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types/client";
import { UserPlus } from "lucide-react";

interface RecentClientsTableProps {
  clients: Client[];
}

export function RecentClientsTable({ clients }: RecentClientsTableProps) {
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients récents</CardTitle>
          <CardDescription>Les 5 derniers clients ajoutés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucun client enregistré</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Clients récents</CardTitle>
          <CardDescription className="mt-1">Les 5 derniers clients ajoutés</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => router.push("/clients")}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ajouté le
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total dû
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{client.nom}</div>
                    {client.email && (
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(client.dateCreation)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {formatMontant(client.totalDu || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={
                        client.totalDu > 0
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {client.totalDu > 0 ? "Impayé" : "À jour"}
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
