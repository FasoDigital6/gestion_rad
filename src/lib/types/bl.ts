/**
 * Types pour les Bons de Livraison (BL)
 * Selon le cahier des charges RAD - Section 6
 */

import {
  LigneDocument,
  CreateLigneInput,
  StatutBL,
  HistoriqueAction,
  PieceJointe,
  ReferenceDocument,
} from "./common";

/**
 * Type Bon de Livraison complet
 */
export type BonDeLivraison = {
  id: string;
  numero: string; // Numéro de BL (ex: BL-2024-001)

  clientId: string; // ID du client
  clientNom: string; // Nom du client (dénormalisé)

  // Référence au BDC
  bdcId: string;
  bdcNumero: string;

  // Dates
  dateCreation: Date;
  dateLivraison: Date; // Date effective de livraison
  dateLivraisonPrevue?: Date; // Date prévue de livraison

  // Lignes du BL (quantités réellement livrées)
  lignes: LigneDocument[];

  // Montants
  totalHT: number;
  totalTVA: number;
  totalTTC: number;

  // Statut et informations
  statut: StatutBL;
  notes?: string;

  // Informations de livraison
  lieuLivraison?: string;
  receptionnePar?: string; // Nom de la personne qui a réceptionné
  signatureReceptionnaire?: string; // URL de la signature

  // Type de livraison
  typeLivraison: "complete" | "partielle";
  estDerniereLivraison: boolean; // True si c'est la dernière livraison pour ce BDC

  // Documents liés
  factures: ReferenceDocument[]; // Liste des factures qui incluent ce BL

  // Suivi financier
  estFacture: boolean; // True si au moins une facture inclut ce BL
  montantFacture: number; // Montant déjà facturé pour ce BL

  // Historique et pièces jointes
  historique: HistoriqueAction[];
  piecesJointes: PieceJointe[];

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  dateModification?: Date;
};

/**
 * Type pour la création d'un BL
 */
export type CreateBLInput = {
  bdcId: string;
  dateLivraison: Date;
  dateLivraisonPrevue?: Date;
  lignes: CreateLigneInput[];
  notes?: string;
  lieuLivraison?: string;
  receptionnePar?: string;
  typeLivraison: "complete" | "partielle";
};

/**
 * Type pour la mise à jour d'un BL
 */
export type UpdateBLInput = Partial<Omit<CreateBLInput, "bdcId">> & {
  id: string;
  statut?: StatutBL;
};

/**
 * Type pour la validation des quantités livrées
 */
export type ValidationQuantitesLivraison = {
  bdcId: string;
  lignes: {
    ligneBDCId: string; // ID de la ligne dans le BDC
    designation: string;
    quantiteCommandee: number;
    quantiteDejaLivree: number;
    quantiteALivrer: number; // Quantité qu'on souhaite livrer maintenant
    quantiteRestante: number; // Quantité restante après cette livraison
  }[];
};
