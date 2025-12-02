"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMontant } from "@/lib/utils/facture";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CycleStatusCardProps {
  title: string;
  montant: number;
  count: number;
  icon: LucideIcon;
  color: "blue" | "orange" | "green" | "red";
  href?: string;
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
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

export function CycleStatusCard({
  title,
  montant,
  count,
  icon: Icon,
  color,
  href,
}: CycleStatusCardProps) {
  const styles = colorStyles[color];

  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-lg ${styles.iconBg} p-3`}>
          <Icon className={`h-5 w-5 ${styles.text}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={`text-2xl font-bold ${styles.text}`}>
          {formatMontant(montant)}
        </div>
        <p className="text-xs text-muted-foreground">
          {count} {count > 1 ? "documents" : "document"}
        </p>
        {href && (
          <Button variant="link" className="p-0 h-auto text-xs" asChild>
            <Link href={href}>
              Voir détails <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </>
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      {content}
    </Card>
  );
}
