"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export type StatColor = "blue" | "purple" | "green" | "red";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: StatColor;
}

const colorStyles: Record<
  StatColor,
  { bg: string; text: string; iconBg: string }
> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    iconBg: "bg-green-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    iconBg: "bg-red-100",
  },
};

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg ${styles.iconBg} p-3`}>
          <Icon className={`h-5 w-5 ${styles.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${styles.text}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
