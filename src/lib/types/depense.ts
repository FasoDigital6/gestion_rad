/**
 * Types pour les Dépenses
 * Selon le cahier des charges RAD - Section 9
 */

import { HistoriqueAction, PieceJointe } from "./common";

/**
 * Catégories de dépenses
 */
export type CategorieDepense =
  | "fournitures"
  | "transport"
  | "salaires"
  | "loyer"
  | "electricite"
  | "eau"
  | "internet"
  | "telephonie"
  | "maintenance"
  | "formation"
  | "autre";

/**
 * Type Dépense complet
 */
export type Depense = {
  id: string;
  numero: string; // Numéro de dépense (ex: DEP-2024-001)

  // Informations de base
  designation: string; // Description de la dépense
  categorie: CategorieDepense;
  montant: number;

  // Dates
  dateCreation: Date;
  dateDepense: Date; // Date de la dépense

  // Fournisseur (optionnel)
  fournisseur?: string;
  numeroFactureFournisseur?: string;

  // Liaison avec commande (optionnel)
  bdcId?: string; // Si la dépense est liée à un BDC
  bdcNumero?: string;

  // Notes et justificatifs
  notes?: string;
  justificatifs: PieceJointe[]; // Factures fournisseurs, reçus, etc.

  // Statut
  statut: "en_attente" | "validee" | "payee" | "annulee";

  // Paiement
  modePaiement?: "especes" | "cheque" | "virement" | "carte" | "mobile_money";
  datePaiement?: Date;

  // Historique
  historique: HistoriqueAction[];

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  dateModification?: Date;
};

/**
 * Type pour la création d'une dépense
 */
export type CreateDepenseInput = {
  designation: string;
  categorie: CategorieDepense;
  montant: number;
  dateDepense: Date;
  fournisseur?: string;
  numeroFactureFournisseur?: string;
  bdcId?: string;
  notes?: string;
  modePaiement?: "especes" | "cheque" | "virement" | "carte" | "mobile_money";
  datePaiement?: Date;
};

/**
 * Type pour la mise à jour d'une dépense
 */
export type UpdateDepenseInput = Partial<CreateDepenseInput> & {
  id: string;
  statut?: "en_attente" | "validee" | "payee" | "annulee";
};

/**
 * Type pour les statistiques des dépenses
 */
export type StatistiquesDepenses = {
  totalDepenses: number;
  depensesCeMois: number;
  depensesCetteAnnee: number;
  parCategorie: {
    categorie: CategorieDepense;
    montant: number;
    pourcentage: number;
  }[];
  evolutionMensuelle: {
    mois: string;
    montant: number;
  }[];
};
