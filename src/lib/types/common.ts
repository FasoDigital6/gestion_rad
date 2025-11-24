/**
 * Types communs partagés entre les différents documents
 * Selon le cahier des charges RAD
 */

/**
 * Type pour une ligne d'article dans un document (Proforma, BDC, BL, Facture)
 */
export type LigneDocument = {
  id: string; // ID unique de la ligne
  designation: string; // Désignation de l'article
  quantite: number; // Quantité commandée/livrée/facturée
  unite: string; // Unité de mesure (pcs, kg, m, etc.)
  prixUnitaire: number; // Prix unitaire HT
  montantHT: number; // Montant HT (quantite * prixUnitaire)
  tva?: number; // Taux de TVA en % (optionnel)
  montantTTC?: number; // Montant TTC (montantHT + TVA)
  notes?: string; // Notes ou remarques sur la ligne
};

/**
 * Type pour la création d'une ligne (sans id et montants calculés)
 */
export type CreateLigneInput = {
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  tva?: number;
  notes?: string;
};

/**
 * Statuts des Proformas
 */
export type StatutProforma = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

/**
 * Statuts des Bons de Commande
 */
export type StatutBDC = "recu" | "en_cours" | "termine" | "annule";

/**
 * Statuts des Bons de Livraison
 */
export type StatutBL = "prepare" | "livre" | "facture" | "annule";

/**
 * Statuts des Factures
 */
export type StatutFacture = "brouillon" | "envoyee" | "partiellement_payee" | "payee" | "en_retard" | "annulee";

/**
 * Statuts des Paiements
 */
export type StatutPaiement = "en_attente" | "valide" | "annule";

/**
 * Modes de paiement
 */
export type ModePaiement = "especes" | "cheque" | "virement" | "carte" | "mobile_money" | "autre";

/**
 * Types de documents
 */
export type TypeDocument = "proforma" | "bdc" | "bl" | "facture";

/**
 * Type pour l'historique d'un document
 */
export type HistoriqueAction = {
  id: string;
  action: string; // "creation", "modification", "validation", "annulation", etc.
  utilisateur: string; // ID ou nom de l'utilisateur
  date: Date;
  details?: string; // Détails de l'action
};

/**
 * Type pour les pièces jointes
 */
export type PieceJointe = {
  id: string;
  nom: string;
  url: string;
  type: string; // type MIME (application/pdf, image/jpeg, etc.)
  taille: number; // taille en bytes
  dateAjout: Date;
};

/**
 * Informations de document (référence croisée)
 */
export type ReferenceDocument = {
  id: string;
  numero: string;
  type: TypeDocument;
  date: Date;
};
