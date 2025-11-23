"use client";

import { Client } from "@/lib/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Receipt, AlertCircle } from "lucide-react";

interface ClientFinancialStatsProps {
  client: Client;
}

export function ClientFinancialStats({ client }: ClientFinancialStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total livré",
      value: client.totalLivre,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total facturé",
      value: client.totalFacture,
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total payé",
      value: client.totalPaye,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total dû",
      value: client.totalDu,
      icon: AlertCircle,
      color: client.totalDu > 0 ? "text-red-600" : "text-gray-600",
      bgColor: client.totalDu > 0 ? "bg-red-100" : "bg-gray-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques financières</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
