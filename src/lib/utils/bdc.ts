import { Bdc, BdcStatut } from "@/lib/types/bdc";

/**
 * Retourne le style CSS pour un badge de statut BDC
 */
export function getBdcStatusStyle(statut: BdcStatut): string {
  const styles = {
    BROUILLON: "bg-muted text-muted-foreground",
    ENVOYE: "bg-brand/10 text-brand",
    APPROUVE: "bg-success/10 text-success",
    ANNULE: "bg-destructive/10 text-destructive",
  };
  return styles[statut];
}

/**
 * Retourne le label français pour un statut BDC
 */
export function getBdcStatusLabel(statut: BdcStatut): string {
  const labels = {
    BROUILLON: "Brouillon",
    ENVOYE: "Envoyé",
    APPROUVE: "Approuvé",
    ANNULE: "Annulé",
  };
  return labels[statut];
}

/**
 * Vérifie si un BDC peut être modifié
 */
export function canEditBdc(bdc: Bdc): boolean {
  return bdc.statut === "BROUILLON";
}

/**
 * Vérifie si un BDC peut être supprimé
 */
export function canDeleteBdc(bdc: Bdc): boolean {
  return bdc.statut === "BROUILLON";
}

/**
 * Retourne les statuts possibles suivants pour un statut donné
 */
export function getNextBdcStatuses(currentStatut: BdcStatut): BdcStatut[] {
  const transitions: Record<BdcStatut, BdcStatut[]> = {
    BROUILLON: ["ENVOYE", "ANNULE"],
    ENVOYE: ["APPROUVE", "ANNULE"],
    APPROUVE: ["ANNULE"], // Peut toujours annuler un BDC approuvé
    ANNULE: [], // État final
  };
  return transitions[currentStatut];
}
