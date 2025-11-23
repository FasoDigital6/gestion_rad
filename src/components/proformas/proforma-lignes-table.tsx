"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  FieldArrayWithId,
} from "react-hook-form";

interface ProformaLignesTableProps {
  fields: FieldArrayWithId<
    {
      numeroDA: string;
      clientId: string;
      dateLivraison: string;
      lignes: {
        designation: string;
        unite: string;
        quantite: number;
        prixUnitaire: number;
      }[];
      remisePourcentage?: number | undefined;
    },
    "lignes",
    "id"
  >[];
  register: UseFormRegister<{
    numeroDA: string;
    clientId: string;
    dateLivraison: string;
    lignes: {
      designation: string;
      unite: string;
      quantite: number;
      prixUnitaire: number;
    }[];
    remisePourcentage?: number | undefined;
  }>;
  remove: (index: number) => void;
  errors: FieldErrors<{
    numeroDA: string;
    clientId: string;
    dateLivraison: string;
    lignes: {
      designation: string;
      unite: string;
      quantite: number;
      prixUnitaire: number;
    }[];
    remisePourcentage?: number | undefined;
  }>;
}

export function ProformaLignesTable({
  fields,
  register,
  remove,
  errors,
}: ProformaLignesTableProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-2 font-medium">N°</th>
            <th className="text-left p-2 font-medium">Désignation</th>
            <th className="text-left p-2 font-medium">Unité</th>
            <th className="text-left p-2 font-medium">Qté</th>
            <th className="text-left p-2 font-medium">Prix Unitaire</th>
            <th className="text-left p-2 font-medium">Prix Total (GNF)</th>
            <th className="text-center p-2 font-medium w-[50px]"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            const quantite =
              parseFloat(
                (
                  document.getElementById(
                    `lignes.${index}.quantite`
                  ) as HTMLInputElement
                )?.value || "0"
              ) || 0;
            const prixUnitaire =
              parseFloat(
                (
                  document.getElementById(
                    `lignes.${index}.prixUnitaire`
                  ) as HTMLInputElement
                )?.value || "0"
              ) || 0;
            const prixTotal = quantite * prixUnitaire;

            return (
              <tr key={field.id} className="border-t">
                <td className="p-2">
                  <div className="w-10 text-center">{index + 1}</div>
                </td>
                <td className="p-2">
                  <Input
                    {...register(`lignes.${index}.designation`)}
                    placeholder="Ex: Ring Snap, 07179-14160, Komatsu"
                    className="min-w-[300px]"
                  />
                  {errors.lignes?.[index]?.designation && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.lignes[index]?.designation?.message}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <Input
                    {...register(`lignes.${index}.unite`)}
                    placeholder="UN"
                    className="w-20"
                  />
                  {errors.lignes?.[index]?.unite && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.lignes[index]?.unite?.message}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <Input
                    id={`lignes.${index}.quantite`}
                    type="number"
                    min="1"
                    {...register(`lignes.${index}.quantite`, {
                      valueAsNumber: true,
                    })}
                    className="w-20"
                  />
                  {errors.lignes?.[index]?.quantite && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.lignes[index]?.quantite?.message}
                    </p>
                  )}
                </td>
                <td className="p-2">
                  <Input
                    id={`lignes.${index}.prixUnitaire`}
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`lignes.${index}.prixUnitaire`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                    className="w-32"
                  />
                  {errors.lignes?.[index]?.prixUnitaire && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.lignes[index]?.prixUnitaire?.message}
                    </p>
                  )}
                </td>
                <td className="p-2 text-right font-medium">
                  {prixTotal.toLocaleString("fr-FR")}
                </td>
                <td className="p-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
