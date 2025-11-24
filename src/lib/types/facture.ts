/**
 * Types pour les Factures
 * Selon le cahier des charges RAD - Section 7
 */

import {
  LigneDocument,
  StatutFacture,
  HistoriqueAction,
  PieceJointe,
  ReferenceDocument,
} from "./common";

/**
 * Type Facture complet
 */
export type Facture = {
  id: string;
  numero: string; // Numéro de facture (ex: FAC-2024-001)

  clientId: string; // ID du client
  clientNom: string; // Nom du client (dénormalisé)

  // Référence au BDC
  bdcId: string;
  bdcNumero: string;

  // Références aux BL (une facture peut regrouper plusieurs BL)
  bls: ReferenceDocument[];

  // Dates
  dateCreation: Date;
  dateFacture: Date; // Date de la facture
  dateEcheance: Date; // Date d'échéance de paiement
  dateEnvoi?: Date; // Date d'envoi au client

  // Lignes de la facture (agrégées depuis les BL)
  lignes: LigneDocument[];

  // Montants
  totalHT: number;
  totalTVA: number;
  totalTTC: number;

  // Statut et informations
  statut: StatutFacture;
  notes?: string;
  conditions?: string; // Conditions de paiement

  // Suivi des paiements
  montantPaye: number; // Montant total payé
  montantRestant: number; // Montant restant à payer (totalTTC - montantPaye)
  delaiPaiementJours: number; // Délai de paiement en jours

  // Paiements liés
  paiements: ReferenceDocument[]; // Liste des paiements reçus

  // Relances
  datesDernieresRelances: Date[]; // Dates des relances effectuées
  nombreRelances: number;

  // Historique et pièces jointes
  historique: HistoriqueAction[];
  piecesJointes: PieceJointe[];

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  dateModification?: Date;
};

/**
 * Type pour la création d'une facture
 */
export type CreateFactureInput = {
  bdcId: string;
  blIds: string[]; // IDs des BL à inclure dans la facture
  dateFacture: Date;
  delaiPaiementJours: number;
  notes?: string;
  conditions?: string;
};

/**
 * Type pour la mise à jour d'une facture
 */
export type UpdateFactureInput = Partial<Omit<CreateFactureInput, "bdcId" | "blIds">> & {
  id: string;
  statut?: StatutFacture;
};

/**
 * Type pour l'aperçu avant création de facture
 */
export type AperçuFacture = {
  bdcId: string;
  bdcNumero: string;
  clientId: string;
  clientNom: string;
  bls: {
    id: string;
    numero: string;
    dateLivraison: Date;
    montantHT: number;
    montantTTC: number;
    estDejaFacture: boolean;
  }[];
  lignesAgregees: LigneDocument[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};
