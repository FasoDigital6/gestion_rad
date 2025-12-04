"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Bdc } from "@/lib/types/bdc";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { getBdcStatusStyle, getBdcStatusLabel } from "@/lib/utils/bdc";

interface CreateColumnsProps {
    onView: (bdc: Bdc) => void;
}

export function createColumns({
    onView,
}: CreateColumnsProps): ColumnDef<Bdc>[] {
    return [
        {
            accessorKey: "numero",
            header: "Numéro",
            cell: ({ row }) => {
                const numero = row.getValue("numero") as string;
                return <div className="font-medium">{numero}</div>;
            },
        },
        {
            accessorKey: "proformaNumero",
            header: "Proforma",
            cell: ({ row }) => {
                const proformaNumero = row.getValue("proformaNumero") as string;
                return <div className="text-sm text-muted-foreground">{proformaNumero || "-"}</div>;
            },
        },
        {
            accessorKey: "clientNom",
            header: "Client",
            cell: ({ row }) => {
                const clientNom = row.getValue("clientNom") as string;
                return <div className="max-w-[200px] truncate">{clientNom}</div>;
            },
        },
        {
            accessorKey: "dateCommande",
            header: "Date commande",
            cell: ({ row }) => {
                const date = row.getValue("dateCommande") as Date;
                return (
                    <div className="text-sm text-muted-foreground">
                        {format(date, "dd/MM/yyyy", { locale: fr })}
                    </div>
                );
            },
        },
        {
            accessorKey: "totalNet",
            header: "Montant",
            cell: ({ row }) => {
                const montant = row.getValue("totalNet") as number;
                return (
                    <div className="font-medium text-right">
                        {montant.toLocaleString("fr-FR")} GNF
                    </div>
                );
            },
        },
        {
            accessorKey: "statut",
            header: "Statut",
            cell: ({ row }) => {
                const bdc = row.original;
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBdcStatusStyle(
                            bdc.statut
                        )}`}
                    >
                        {getBdcStatusLabel(bdc.statut)}
                    </span>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const bdc = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(bdc)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
