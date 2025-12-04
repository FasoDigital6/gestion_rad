"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DocumentStats } from "@/lib/utils/dashboard";

interface InvoicesDonutChartProps {
  data: DocumentStats;
}

const STATUT_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  BROUILLON: { label: "Brouillon", color: "#9ca3af" }, // gray-400
  EMISE: { label: "Émise", color: "#3b82f6" }, // blue-500
  PAYEE_PARTIELLE: { label: "Payée partiellement", color: "#f59e0b" }, // amber-500
  PAYEE: { label: "Payée", color: "#22c55e" }, // green-500
  ANNULEE: { label: "Annulée", color: "#ef4444" }, // red-500
};

export function InvoicesDonutChart({ data }: InvoicesDonutChartProps) {
  const chartData = Object.entries(data.parStatut)
    .filter(([_, count]) => count > 0)
    .map(([statut, count]) => ({
      name: STATUT_CONFIG[statut]?.label || statut,
      value: count,
      color: STATUT_CONFIG[statut]?.color || "#9ca3af",
    }));

  const renderCustomLabel = (props: unknown) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
    } = props as Record<string, number>;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Ne pas afficher si < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des factures</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Aucune facture
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel as unknown as boolean}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: unknown) => {
                  const e = entry as Record<string, Record<string, unknown>>;
                  return `${value} (${e.payload.value})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{data.total}</span>{" "}
            factures
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
