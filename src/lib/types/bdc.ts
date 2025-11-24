/**
 * Types pour les Bons de Commande (BDC)
 * Selon le cahier des charges RAD - Section 5
 */

import {
  LigneDocument,
  CreateLigneInput,
  StatutBDC,
  HistoriqueAction,
  PieceJointe,
  ReferenceDocument,
} from "./common";

/**
 * Type Bon de Commande complet
 */
export type BonDeCommande = {
  id: string;
  numero: string; // Numéro de BDC (ex: BDC-2024-001)
  numeroBDCClient: string; // Numéro de BDC du client (sur son document)

  clientId: string; // ID du client
  clientNom: string; // Nom du client (dénormalisé)

  // Dates
  dateCreation: Date;
  dateCommande: Date; // Date de la commande du client
  dateReception: Date; // Date de réception du BDC

  // Référence au proforma (si créé depuis un proforma)
  proformaId?: string;
  proformaNumero?: string;

  // Lignes du BDC
  lignes: LigneDocument[];

  // Montants
  totalHT: number;
  totalTVA: number;
  totalTTC: number;

  // Statut et informations
  statut: StatutBDC;
  notes?: string;

  // Import du BDC client (PDF)
  bdcClientPDF?: string; // URL du PDF du BDC du client
  sourceCreation: "proforma" | "import_pdf" | "manuel";

  // Documents liés (Bons de Livraison)
  bls: ReferenceDocument[]; // Liste des BL liés
  factures: ReferenceDocument[]; // Liste des factures liées

  // Suivi des quantités
  quantiteCommandee: number; // Total des quantités commandées
  quantiteLivree: number; // Total des quantités livrées
  quantiteFacturee: number; // Total des quantités facturées
  quantiteRestante: number; // Quantité restante à livrer

  // Historique et pièces jointes
  historique: HistoriqueAction[];
  piecesJointes: PieceJointe[];

  // Métadonnées
  creePar: string;
  modifiePar?: string;
  dateModification?: Date;
};

/**
 * Type pour la création d'un BDC
 */
export type CreateBDCInput = {
  numeroBDCClient: string;
  clientId: string;
  dateCommande: Date;
  lignes: CreateLigneInput[];
  notes?: string;
  proformaId?: string; // Si créé depuis un proforma
  bdcClientPDF?: string; // URL du PDF du client
  sourceCreation: "proforma" | "import_pdf" | "manuel";
};

/**
 * Type pour la mise à jour d'un BDC
 */
export type UpdateBDCInput = Partial<Omit<CreateBDCInput, "clientId">> & {
  id: string;
  statut?: StatutBDC;
};

/**
 * Type pour l'import d'un BDC client (PDF)
 */
export type ImportBDCInput = {
  clientId: string;
  numeroBDCClient: string;
  dateCommande: Date;
  fichierPDF: File | string;
  lignes: {
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
  }[]; // Lignes extraites du PDF
};
