"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { FileText, ShoppingCart, Truck, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DocumentType = "proforma" | "bdc" | "bdl" | "facture";

interface StatutBreakdown {
  statut: string;
  count: number;
  color: string;
}

interface DocumentCounterCardProps {
  type: DocumentType;
  total: number;
  breakdown: StatutBreakdown[];
  onClick?: (statut?: string) => void;
}

const documentConfig: Record<
  DocumentType,
  { label: string; icon: LucideIcon; route: string }
> = {
  proforma: {
    label: "Proformas",
    icon: FileText,
    route: "/proformas",
  },
  bdc: {
    label: "Bons de commande",
    icon: ShoppingCart,
    route: "/bdc",
  },
  bdl: {
    label: "Bons de livraison",
    icon: Truck,
    route: "/bdl",
  },
  facture: {
    label: "Factures",
    icon: Receipt,
    route: "/factures",
  },
};

export function DocumentCounterCard({
  type,
  total,
  breakdown,
  onClick,
}: DocumentCounterCardProps) {
  const router = useRouter();
  const config = documentConfig[type];
  const Icon = config.icon;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(config.route);
    }
  };

  const handleBadgeClick = (statut: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(statut);
    } else {
      router.push(`${config.route}?statut=${statut}`);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {breakdown.map((item) => (
            <Badge
              key={item.statut}
              variant="outline"
              className={`${item.color} cursor-pointer hover:opacity-80`}
              onClick={(e) => handleBadgeClick(item.statut, e)}
            >
              {item.statut}: {item.count}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
