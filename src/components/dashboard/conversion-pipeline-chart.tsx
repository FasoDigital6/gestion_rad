"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ConversionRates } from "@/lib/utils/dashboard";

interface ConversionPipelineChartProps {
  data: ConversionRates;
}

// Couleur selon performance
const getColorForRate = (rate: number): string => {
  if (rate >= 80) return "#22c55e"; // green-500 - Excellent
  if (rate >= 50) return "#f59e0b"; // amber-500 - Moyen
  return "#ef4444"; // red-500 - Faible
};

export function ConversionPipelineChart({ data }: ConversionPipelineChartProps) {
  const chartData = [
    {
      name: "Proforma → BDC",
      rate: data.proformaVersBDC,
      fill: getColorForRate(data.proformaVersBDC),
    },
    {
      name: "BDC → BDL",
      rate: data.bdcVersBDL,
      fill: getColorForRate(data.bdcVersBDL),
    },
    {
      name: "BDL → Facture",
      rate: data.bdlVersFacture,
      fill: getColorForRate(data.bdlVersFacture),
    },
    {
      name: "Facture → Paiement",
      rate: data.factureVersPaiement,
      fill: getColorForRate(data.factureVersPaiement),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline de conversion</CardTitle>
        <CardDescription>
          Taux de transformation à chaque étape du processus de vente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-sm"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              className="text-sm"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="rate" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>≥ 80% Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>50-80% Moyen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>&lt; 50% Faible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
