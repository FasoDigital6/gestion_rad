"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BonDeCommande } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutColors: Record<string, string> = {
  recu: "bg-blue-500",
  en_cours: "bg-yellow-500",
  termine: "bg-green-500",
  annule: "bg-red-500",
};

const statutLabels: Record<string, string> = {
  recu: "Reçu",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export const columns: ColumnDef<BonDeCommande>[] = [
  {
    accessorKey: "numero",
    header: "Numéro",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numero")}</div>
    ),
  },
  {
    accessorKey: "numeroBDCClient",
    header: "N° Client",
  },
  {
    accessorKey: "clientNom",
    header: "Client",
  },
  {
    accessorKey: "dateCommande",
    header: "Date commande",
    cell: ({ row }) => {
      const date = row.getValue("dateCommande") as Date;
      return format(date, "dd MMM yyyy", { locale: fr });
    },
  },
  {
    accessorKey: "totalTTC",
    header: "Montant TTC",
    cell: ({ row }) => {
      const montant = row.getValue("totalTTC") as number;
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(montant);
    },
  },
  {
    header: "Progression",
    cell: ({ row }) => {
      const bdc = row.original;
      const progression =
        bdc.quantiteCommandee > 0
          ? Math.round((bdc.quantiteLivree / bdc.quantiteCommandee) * 100)
          : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${progression}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{progression}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string;
      return (
        <Badge className={statutColors[statut]}>{statutLabels[statut]}</Badge>
      );
    },
  },
];
