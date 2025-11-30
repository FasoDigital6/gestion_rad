import { Bdl, BdlStatut } from "@/lib/types/bdl";

/**
 * Retourne le style CSS pour un badge de statut BDL
 */
export function getBdlStatusStyle(statut: BdlStatut): string {
  const styles = {
    BROUILLON: "bg-muted text-muted-foreground",
    EN_ROUTE: "bg-brand/10 text-brand",
    LIVRE: "bg-success/10 text-success",
    ANNULE: "bg-destructive/10 text-destructive",
  };
  return styles[statut];
}

/**
 * Retourne le label français pour un statut BDL
 */
export function getBdlStatusLabel(statut: BdlStatut): string {
  const labels = {
    BROUILLON: "Brouillon",
    EN_ROUTE: "En route",
    LIVRE: "Livré",
    ANNULE: "Annulé",
  };
  return labels[statut];
}

/**
 * Vérifie si un BDL peut être modifié
 */
export function canEditBdl(bdl: Bdl): boolean {
  return bdl.statut === "BROUILLON";
}

/**
 * Vérifie si un BDL peut être supprimé
 */
export function canDeleteBdl(bdl: Bdl): boolean {
  return bdl.statut === "BROUILLON";
}

/**
 * Retourne les statuts possibles suivants pour un statut donné
 */
export function getNextBdlStatuses(currentStatut: BdlStatut): BdlStatut[] {
  const transitions: Record<BdlStatut, BdlStatut[]> = {
    BROUILLON: ["EN_ROUTE", "ANNULE"],
    EN_ROUTE: ["LIVRE", "ANNULE"],
    LIVRE: [], // État final
    ANNULE: [], // État final
  };
  return transitions[currentStatut];
}

/**
 * Formatte l'heure de livraison pour l'affichage
 */
export function formatDeliveryTime(
  dateLivraison: Date,
  heureLivraison?: string
): string {
  const dateStr = dateLivraison.toLocaleDateString("fr-FR");
  if (heureLivraison) {
    return `${dateStr} à ${heureLivraison}`;
  }
  return dateStr;
}
