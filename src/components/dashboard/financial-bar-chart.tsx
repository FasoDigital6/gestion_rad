"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMontant } from "@/lib/utils/dashboard";
import type { FinancialKPIs } from "@/lib/hooks/use-dashboard-stats";

interface FinancialBarChartProps {
  data: FinancialKPIs;
}

export function FinancialBarChart({ data }: FinancialBarChartProps) {
  const chartData = [
    {
      name: "Livré",
      value: data.totalLivre,
      fill: "#3b82f6", // blue-500
    },
    {
      name: "Facturé",
      value: data.totalFacture,
      fill: "#a855f7", // purple-500
    },
    {
      name: "Payé",
      value: data.totalPaye,
      fill: "#22c55e", // green-500
    },
    {
      name: "Dû",
      value: data.totalDu,
      fill: "#ef4444", // red-500
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue financière globale</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-sm"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-sm"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip
              formatter={(value: number) => formatMontant(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
