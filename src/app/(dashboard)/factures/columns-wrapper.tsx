"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Facture } from "@/lib/types/facture";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import {
    getFactureStatusLabel,
    getFactureStatusStyle,
    formatMontant,
} from "@/lib/utils/facture";
import Link from "next/link";

interface CreateColumnsProps {
    onView: (facture: Facture) => void;
}

export function createColumns({
    onView,
}: CreateColumnsProps): ColumnDef<Facture>[] {
    return [
        {
            accessorKey: "numero",
            header: "Numéro",
            cell: ({ row }) => {
                const numero = row.getValue("numero") as string;
                const id = row.original.id;
                return (
                    <Link
                        href={`/factures/${id}`}
                        className="text-sm font-medium text-brand hover:underline"
                    >
                        {numero}
                    </Link>
                );
            },
        },
        {
            accessorKey: "clientNom",
            header: "Client",
            cell: ({ row }) => {
                const clientNom = row.getValue("clientNom") as string;
                return <div className="font-medium text-gray-900">{clientNom}</div>;
            },
        },
        {
            accessorKey: "dateEmission",
            header: "Date émission",
            cell: ({ row }) => {
                const date = row.getValue("dateEmission") as Date;
                return (
                    <div className="text-sm text-gray-500">
                        {format(date, "dd MMM yyyy", { locale: fr })}
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
                    <div className="text-right text-sm font-medium text-gray-900">
                        {formatMontant(montant)}
                    </div>
                );
            },
        },
        {
            accessorKey: "totalPaye",
            header: "Payé",
            cell: ({ row }) => {
                const montant = row.getValue("totalPaye") as number;
                return (
                    <div className="text-right text-sm font-medium text-green-600">
                        {formatMontant(montant)}
                    </div>
                );
            },
        },
        {
            accessorKey: "soldeRestant",
            header: "Solde",
            cell: ({ row }) => {
                const solde = row.getValue("soldeRestant") as number;
                return (
                    <div
                        className={`text-right text-sm font-medium ${solde > 0 ? "text-red-600" : "text-green-600"
                            }`}
                    >
                        {formatMontant(solde)}
                    </div>
                );
            },
        },
        {
            accessorKey: "statut",
            header: "Statut",
            cell: ({ row }) => {
                const statut = row.original.statut;
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFactureStatusStyle(
                            statut
                        )}`}
                    >
                        {getFactureStatusLabel(statut)}
                    </span>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const facture = row.original;

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
                            <DropdownMenuItem onClick={() => onView(facture)}>
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
