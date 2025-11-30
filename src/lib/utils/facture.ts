import type {
  Facture,
  FactureStatut,
  FactureLigne,
} from "../types/facture";

/**
 * Retourne le label français d'un statut de facture
 */
export function getFactureStatusLabel(statut: FactureStatut): string {
  const labels: Record<FactureStatut, string> = {
    BROUILLON: "Brouillon",
    EMISE: "Émise",
    PAYEE_PARTIELLE: "Payée partiellement",
    PAYEE: "Payée",
    ANNULEE: "Annulée",
  };
  return labels[statut];
}

/**
 * Retourne les classes CSS pour le badge de statut
 */
export function getFactureStatusStyle(statut: FactureStatut): string {
  const styles: Record<FactureStatut, string> = {
    BROUILLON: "bg-gray-100 text-gray-800",
    EMISE: "bg-blue-100 text-blue-800",
    PAYEE_PARTIELLE: "bg-orange-100 text-orange-800",
    PAYEE: "bg-green-100 text-green-800",
    ANNULEE: "bg-red-100 text-red-800",
  };
  return styles[statut];
}

/**
 * Retourne les statuts possibles suivants selon le statut actuel
 */
export function getNextFactureStatuses(
  currentStatut: FactureStatut
): FactureStatut[] {
  const transitions: Record<FactureStatut, FactureStatut[]> = {
    BROUILLON: ["EMISE", "ANNULEE"],
    EMISE: ["ANNULEE"], // Paiements gérés automatiquement
    PAYEE_PARTIELLE: ["ANNULEE"], // Paiements gérés automatiquement
    PAYEE: [], // État final - aucune transition
    ANNULEE: [], // État final - aucune transition
  };
  return transitions[currentStatut];
}

/**
 * Vérifie si une facture peut être modifiée
 * Seulement possible en statut BROUILLON
 */
export function canEditFacture(facture: Facture): boolean {
  return facture.statut === "BROUILLON";
}

/**
 * Vérifie si une facture peut être supprimée
 * Seulement possible en statut BROUILLON
 */
export function canDeleteFacture(facture: Facture): boolean {
  return facture.statut === "BROUILLON";
}

/**
 * Vérifie si une facture peut être émise
 */
export function canEmettreFacture(facture: Facture): boolean {
  return facture.statut === "BROUILLON" && facture.lignes.length > 0;
}

/**
 * Vérifie si une facture peut être annulée
 */
export function canAnnulerFacture(facture: Facture): boolean {
  return facture.statut !== "PAYEE" && facture.statut !== "ANNULEE";
}

/**
 * Vérifie si on peut ajouter un paiement à une facture
 */
export function canAddPaiement(facture: Facture): boolean {
  return (
    (facture.statut === "EMISE" || facture.statut === "PAYEE_PARTIELLE") &&
    facture.soldeRestant > 0
  );
}

/**
 * Calcule le statut automatiquement selon les paiements
 * (appelé après ajout/suppression de paiement)
 */
export function calculateFactureStatut(
  totalNet: number,
  totalPaye: number,
  currentStatut: FactureStatut
): FactureStatut {
  // Si annulée ou brouillon, ne pas changer
  if (currentStatut === "ANNULEE" || currentStatut === "BROUILLON") {
    return currentStatut;
  }

  // Calcul basé sur les paiements
  if (totalPaye === 0) {
    return "EMISE";
  } else if (totalPaye >= totalNet) {
    return "PAYEE";
  } else {
    return "PAYEE_PARTIELLE";
  }
}

/**
 * Calcule le prix total d'une ligne
 */
export function calculateLignePrixTotal(
  quantite: number,
  prixUnitaire: number
): number {
  return quantite * prixUnitaire;
}

/**
 * Calcule le total de toutes les lignes
 */
export function calculateTotal(lignes: FactureLigne[]): number {
  return lignes.reduce((sum, ligne) => sum + ligne.prixTotal, 0);
}

/**
 * Calcule le montant de remise
 */
export function calculateRemiseMontant(
  total: number,
  remisePourcentage: number
): number {
  return (total * remisePourcentage) / 100;
}

/**
 * Calcule le total net (après remise)
 */
export function calculateTotalNet(
  total: number,
  remiseMontant: number
): number {
  return total - remiseMontant;
}

/**
 * Calcule le solde restant
 */
export function calculateSoldeRestant(
  totalNet: number,
  totalPaye: number
): number {
  return Math.max(0, totalNet - totalPaye);
}

/**
 * Calcule tous les totaux d'une facture
 */
export function calculateFactureTotals(
  lignes: FactureLigne[],
  remisePourcentage: number = 0,
  totalPaye: number = 0
) {
  const total = calculateTotal(lignes);
  const remiseMontant = calculateRemiseMontant(total, remisePourcentage);
  const totalNet = calculateTotalNet(total, remiseMontant);
  const soldeRestant = calculateSoldeRestant(totalNet, totalPaye);

  return {
    total,
    remiseMontant,
    totalNet,
    soldeRestant,
  };
}

/**
 * Formate un montant en FCFA
 */
export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

/**
 * Convertit un montant en lettres (pour PDF)
 */
export function montantEnLettres(montant: number): string {
  // Simplification - à améliorer avec une bibliothèque si nécessaire
  const unites = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const dizaines = [
    "",
    "dix",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  if (montant === 0) return "zéro";
  if (montant < 10) return unites[montant];
  if (montant < 100) {
    const d = Math.floor(montant / 10);
    const u = montant % 10;
    return dizaines[d] + (u > 0 ? "-" + unites[u] : "");
  }

  // Pour les grands montants, retour simple
  return montant.toLocaleString("fr-FR") + " francs CFA";
}
