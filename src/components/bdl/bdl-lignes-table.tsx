import { BdlLigne } from "@/lib/types/bdl";
import { Badge } from "@/components/ui/badge";

interface BdlLignesTableProps {
  lignes: BdlLigne[];
  total: number;
  remisePourcentage: number;
  remiseMontant: number;
  totalNet: number;
}

export function BdlLignesTable({
  lignes,
  total,
  remisePourcentage,
  remiseMontant,
  totalNet,
}: BdlLignesTableProps) {
  return (
    <div className="border border-table-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-table-header border-b border-table-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-12">
                N°
              </th>
              <th className="px-6 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider w-24">
                Unité
              </th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                Qté cmd
              </th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">
                Qté livrée
              </th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-40">
                P.U (GNF)
              </th>
              <th className="px-6 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-40">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {lignes.map((ligne) => (
              <tr key={ligne.numero} className="hover:bg-table-row-hover">
                <td className="px-4 py-3 text-muted-foreground">
                  {ligne.numero}
                </td>
                <td className="px-6 py-3 font-medium">{ligne.designation}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {ligne.unite}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {ligne.quantiteCommandee}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge className="bg-success/10 text-success">
                    {ligne.quantiteLivree}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {ligne.prixUnitaire.toLocaleString("fr-FR")}
                </td>
                <td className="px-6 py-3 text-right font-medium tabular-nums">
                  {ligne.prixTotal.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer totaux */}
      <div className="bg-gradient-to-br from-table-header to-background px-6 py-4 border-t border-table-border">
        <div className="flex flex-col gap-3 ml-auto max-w-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-helper-text font-medium">Sous-total HT</span>
            <span className="font-semibold text-foreground tabular-nums">
              {total.toLocaleString("fr-FR")} GNF
            </span>
          </div>

          {remisePourcentage > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-helper-text font-medium">
                Remise ({remisePourcentage}%)
              </span>
              <span className="font-semibold text-destructive tabular-nums">
                - {remiseMontant.toLocaleString("fr-FR")} GNF
              </span>
            </div>
          )}

          <div className="h-px bg-border my-1" />

          <div className="flex justify-between items-center pt-1">
            <span className="text-lg font-bold text-foreground">
              TOTAL TTC
            </span>
            <div className="text-right">
              <div className="text-xl font-bold text-brand tabular-nums">
                {totalNet.toLocaleString("fr-FR")}
              </div>
              <div className="text-xs font-normal text-helper-text">
                Francs guinéens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
