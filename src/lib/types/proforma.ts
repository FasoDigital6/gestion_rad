/**
 * Types pour les Proformas
 * Selon le cahier des charges RAD - Section 4
 */

import {
  LigneDocument,
  CreateLigneInput,
  StatutProforma,
  HistoriqueAction,
  PieceJointe,
} from "./common";

/**
 * Type Proforma complet
 */
export type Proforma = {
  id: string;
  numero: string; // Numéro de proforma (ex: PRO-2024-001)
  clientId: string; // ID du client
  clientNom: string; // Nom du client (dénormalisé pour affichage)

  // Dates
  dateCreation: Date;
  dateValidite: Date; // Date de validité du proforma
  dateEnvoi?: Date; // Date d'envoi au client

  // Lignes du proforma
  lignes: LigneDocument[];

  // Montants
  totalHT: number; // Total HT
  totalTVA: number; // Total TVA
  totalTTC: number; // Total TTC

  // Statut et informations
  statut: StatutProforma;
  notes?: string; // Notes générales
  conditions?: string; // Conditions de vente

  // Informations d'import (si le proforma vient d'un appel d'offres)
  appelOffre?: {
    source: "email" | "pdf" | "excel" | "word" | "manuel";
    fichierOriginal?: string; // URL du fichier original
    dateImport?: Date;
  };

  // Documents liés
  bdcId?: string; // ID du BDC créé à partir de ce proforma
  bdcNumero?: string; // Numéro du BDC (dénormalisé)

  // Template PDF (pour générer le PDF avec le bon template)
  templatePDF?: string; // "SAG", "KGM", "standard", etc.

  // Historique et pièces jointes
  historique: HistoriqueAction[];
  piecesJointes: PieceJointe[];

  // Métadonnées
  creePar: string; // ID de l'utilisateur créateur
  modifiePar?: string; // ID du dernier utilisateur modificateur
  dateModification?: Date;
};

/**
 * Type pour la création d'un proforma
 */
export type CreateProformaInput = {
  clientId: string;
  dateValidite: Date;
  lignes: CreateLigneInput[];
  notes?: string;
  conditions?: string;
  appelOffre?: {
    source: "email" | "pdf" | "excel" | "word" | "manuel";
    fichierOriginal?: string;
  };
  templatePDF?: string;
};

/**
 * Type pour la mise à jour d'un proforma
 */
export type UpdateProformaInput = Partial<Omit<CreateProformaInput, "clientId">> & {
  id: string;
  statut?: StatutProforma;
};

/**
 * Type pour l'import d'un appel d'offres
 */
export type ImportAppelOffreInput = {
  clientId: string;
  source: "email" | "pdf" | "excel" | "word";
  fichier: File | string; // File object ou URL
  lignes: {
    designation: string;
    quantite: number;
    unite: string;
  }[]; // Lignes extraites automatiquement
};
