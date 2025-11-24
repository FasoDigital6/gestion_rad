/**
 * Types pour les Paiements
 * Selon le cahier des charges RAD - Section 8
 */

import {
  ModePaiement,
  StatutPaiement,
  HistoriqueAction,
  PieceJointe,
} from "./common";

/**
 * Type Paiement complet
 */
export type Paiement = {
  id: string;
  numero: string; // Numéro de paiement (ex: PAY-2024-001)

  // Référence à la facture
  factureId: string;
  factureNumero: string;

  clientId: string; // ID du client
  clientNom: string; // Nom du client (dénormalisé)

  // Dates
  dateCreation: Date;
  datePaiement: Date; // Date effective du paiement
  dateValeur?: Date; // Date de valeur (pour les chèques, virements)

  // Montants
  montant: number; // Montant du paiement
  montantFacture: number; // Montant total de la facture (dénormalisé)
  montantRestant: number; // Montant restant sur la facture après ce paiement

  // Informations de paiement
  modePaiement: ModePaiement;
  reference?: string; // Numéro de chèque, référence virement, etc.
  banque?: string; // Banque (pour chèques, virements)
  notes?: string;

  // Statut
  statut: StatutPaiement;

  // Justificatifs
  justificatifs: PieceJointe[]; // Reçus, copies de chèques, etc.

  // Historique
  historique: HistoriqueAction[];

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  dateModification?: Date;
};

/**
 * Type pour la création d'un paiement
 */
export type CreatePaiementInput = {
  factureId: string;
  montant: number;
  datePaiement: Date;
  dateValeur?: Date;
  modePaiement: ModePaiement;
  reference?: string;
  banque?: string;
  notes?: string;
};

/**
 * Type pour la mise à jour d'un paiement
 */
export type UpdatePaiementInput = Partial<CreatePaiementInput> & {
  id: string;
  statut?: StatutPaiement;
};

/**
 * Type pour le récapitulatif des paiements d'une facture
 */
export type RecapitulatifPaiementsFacture = {
  factureId: string;
  factureNumero: string;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  paiements: {
    id: string;
    numero: string;
    datePaiement: Date;
    montant: number;
    modePaiement: ModePaiement;
    statut: StatutPaiement;
  }[];
  estPayeCompletement: boolean;
  estPayePartiellement: boolean;
  estEnRetard: boolean;
  joursRetard?: number;
};
