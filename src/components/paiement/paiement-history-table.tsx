"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatMontant } from "@/lib/utils/facture";
import {
  getModePaiementLabel,
  getModePaiementStyle,
} from "@/lib/utils/paiement";
import type { Paiement } from "@/lib/types/paiement";

interface PaiementHistoryTableProps {
  paiements: Paiement[];
}

export function PaiementHistoryTable({
  paiements,
}: PaiementHistoryTableProps) {
  if (paiements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500">Aucun paiement enregistré</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPaiements = paiements.reduce(
    (sum, paiement) => sum + paiement.montant,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Historique des paiements ({paiements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Banque</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paiements.map((paiement) => (
                <TableRow key={paiement.id}>
                  <TableCell className="font-medium">
                    {format(paiement.datePaiement, "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModePaiementStyle(
                        paiement.modePaiement
                      )}`}
                    >
                      {getModePaiementLabel(paiement.modePaiement)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {paiement.referencePaiement || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {paiement.banque || "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatMontant(paiement.montant)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                    {paiement.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-end border-t pt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Total des paiements:
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatMontant(totalPaiements)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
