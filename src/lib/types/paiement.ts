/**
 * Types pour la gestion des paiements
 */

/**
 * Modes de paiement supportés
 */
export type ModePaiement =
  | "ESPECES"
  | "CHEQUE"
  | "VIREMENT"
  | "MOBILE_MONEY"
  | "CARTE"
  | "AUTRE";

/**
 * Type Paiement - Historique des paiements d'une facture
 */
export type Paiement = {
  id: string;
  factureId: string; // Référence à la facture
  factureNumero: string; // Dénormalisé pour affichage

  // Montant et mode
  montant: number; // Montant du paiement
  modePaiement: ModePaiement;

  // Détails selon le mode
  referencePaiement?: string; // N° chèque, N° transaction, etc.
  banque?: string; // Si chèque ou virement

  // Dates
  datePaiement: Date; // Date effective du paiement
  dateCreation: Date; // Date d'enregistrement

  // Informations additionnelles
  notes?: string; // Notes sur le paiement
  recu?: string; // Référence du reçu émis
};

/**
 * Type pour ajouter un paiement
 */
export type CreatePaiementInput = {
  factureId: string;
  montant: number;
  modePaiement: ModePaiement;
  datePaiement: Date;
  referencePaiement?: string;
  banque?: string;
  notes?: string;
  recu?: string;
};

/**
 * Type helper: Résumé des paiements d'une facture
 */
export type FacturePaiementsSummary = {
  factureId: string;
  factureNumero: string;
  totalNet: number; // Montant total à payer
  totalPaye: number; // Somme des paiements
  soldeRestant: number; // Reste à payer
  paiements: Paiement[]; // Liste des paiements
  statut: "EMISE" | "PAYEE_PARTIELLE" | "PAYEE"; // Statut calculé
};
