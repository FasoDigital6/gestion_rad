"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMontant } from "@/lib/utils/facture";
import type { FactureLigne } from "@/lib/types/facture";

interface FactureLignesTableProps {
  lignes: FactureLigne[];
  total: number;
  remisePourcentage: number;
  remiseMontant: number;
  totalNet: number;
}

export function FactureLignesTable({
  lignes,
  total,
  remisePourcentage,
  remiseMontant,
  totalNet,
}: FactureLignesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">N°</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead className="w-24">Unité</TableHead>
            <TableHead className="text-right w-24">Quantité</TableHead>
            <TableHead className="text-right w-32">Prix unitaire</TableHead>
            <TableHead className="text-right w-32">Prix total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lignes.map((ligne) => (
            <TableRow key={ligne.numero}>
              <TableCell className="font-medium text-gray-500">
                {ligne.numero}
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <p>{ligne.designation}</p>
                  {/* Traçabilité BDL */}
                  {ligne.bdlSource && ligne.bdlSource.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sources:{" "}
                      {ligne.bdlSource
                        .map((src) => `${src.bdlNumero} (${src.quantite})`)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{ligne.unite}</TableCell>
              <TableCell className="text-right font-medium">
                {ligne.quantite}
              </TableCell>
              <TableCell className="text-right text-gray-700">
                {formatMontant(ligne.prixUnitaire)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatMontant(ligne.prixTotal)}
              </TableCell>
            </TableRow>
          ))}

          {/* Ligne Total HT */}
          <TableRow className="bg-gray-50">
            <TableCell colSpan={5} className="text-right font-medium">
              Total HT
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatMontant(total)}
            </TableCell>
          </TableRow>

          {/* Ligne Remise si applicable */}
          {remisePourcentage > 0 && (
            <TableRow className="bg-gray-50">
              <TableCell colSpan={5} className="text-right font-medium">
                Remise ({remisePourcentage}%)
              </TableCell>
              <TableCell className="text-right font-bold text-red-600">
                - {formatMontant(remiseMontant)}
              </TableCell>
            </TableRow>
          )}

          {/* Ligne Total Net */}
          <TableRow className="bg-brand/5">
            <TableCell colSpan={5} className="text-right font-bold text-lg">
              Total Net à payer
            </TableCell>
            <TableCell className="text-right font-bold text-brand text-lg">
              {formatMontant(totalNet)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
