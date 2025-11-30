import type { ModePaiement, Paiement } from "../types/paiement";

/**
 * Retourne le label français d'un mode de paiement
 */
export function getModePaiementLabel(mode: ModePaiement): string {
  const labels: Record<ModePaiement, string> = {
    ESPECES: "Espèces",
    CHEQUE: "Chèque",
    VIREMENT: "Virement",
    MOBILE_MONEY: "Mobile Money",
    CARTE: "Carte bancaire",
    AUTRE: "Autre",
  };
  return labels[mode];
}

/**
 * Retourne les classes CSS pour le badge de mode de paiement
 */
export function getModePaiementStyle(mode: ModePaiement): string {
  const styles: Record<ModePaiement, string> = {
    ESPECES: "bg-green-100 text-green-800",
    CHEQUE: "bg-blue-100 text-blue-800",
    VIREMENT: "bg-purple-100 text-purple-800",
    MOBILE_MONEY: "bg-orange-100 text-orange-800",
    CARTE: "bg-indigo-100 text-indigo-800",
    AUTRE: "bg-gray-100 text-gray-800",
  };
  return styles[mode];
}

/**
 * Vérifie si un mode de paiement nécessite une référence
 */
export function requiresReference(mode: ModePaiement): boolean {
  return ["CHEQUE", "VIREMENT", "MOBILE_MONEY", "CARTE"].includes(mode);
}

/**
 * Vérifie si un mode de paiement nécessite une banque
 */
export function requiresBanque(mode: ModePaiement): boolean {
  return ["CHEQUE", "VIREMENT"].includes(mode);
}

/**
 * Calcule le total des paiements
 */
export function calculateTotalPaiements(paiements: Paiement[]): number {
  return paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
}

/**
 * Valide un montant de paiement
 */
export function validatePaiementMontant(
  montant: number,
  soldeRestant: number
): { valid: boolean; error?: string } {
  if (montant <= 0) {
    return { valid: false, error: "Le montant doit être supérieur à 0" };
  }

  if (montant > soldeRestant) {
    return {
      valid: false,
      error: `Le montant ne peut pas dépasser le solde restant (${soldeRestant} FCFA)`,
    };
  }

  return { valid: true };
}

/**
 * Génère une référence de reçu
 */
export function generateRecuReference(factureNumero: string): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `RECU-${factureNumero}-${timestamp}`;
}
