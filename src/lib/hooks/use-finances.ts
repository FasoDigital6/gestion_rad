import { useQuery } from "@tanstack/react-query";
import {
  getEtatFinancier,
  getDepensesParCategorie,
  getIndicateursFinanciers,
} from "@/lib/firebase/api/finances";
import { FiltrePeriode } from "@/lib/types/finances";

/**
 * Hook pour récupérer l'état financier global
 */
export function useEtatFinancier() {
  return useQuery({
    queryKey: ["finances", "etat"],
    queryFn: getEtatFinancier,
  });
}

/**
 * Hook pour récupérer les dépenses détaillées par catégorie
 */
export function useDepensesParCategorie() {
  return useQuery({
    queryKey: ["finances", "depenses-par-categorie"],
    queryFn: getDepensesParCategorie,
  });
}

/**
 * Hook pour récupérer les indicateurs financiers avec filtrage par période
 */
export function useIndicateursFinanciers(periode: FiltrePeriode) {
  return useQuery({
    queryKey: ["finances", "indicateurs", periode],
    queryFn: () => getIndicateursFinanciers(periode),
  });
}
