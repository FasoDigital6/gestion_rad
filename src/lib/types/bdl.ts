/**
 * Type BDL (Bon De Livraison) - Support des livraisons partielles
 */

export type BdlStatut = "BROUILLON" | "EN_ROUTE" | "LIVRE" | "ANNULE";

/**
 * Ligne de BDL (article livré)
 * CRITIQUE: Distingue quantité commandée (référence) vs quantité livrée (réel)
 */
export type BdlLigne = {
  numero: number;
  designation: string;
  unite: string; // UN, KG, M, L, etc.

  // LIVRAISONS PARTIELLES - CHAMPS CRITIQUES
  quantiteCommandee: number; // Référence du BDC (lecture seule)
  quantiteLivree: number; // Quantité réellement livrée dans CE BDL

  prixUnitaire: number;
  prixTotal: number; // quantiteLivree * prixUnitaire (calculé automatiquement)
};

/**
 * Type BDL complet
 */
export type Bdl = {
  id: string;
  numero: string; // Format: "001/BDL/2025"

  // Référence au BDC source (OBLIGATOIRE - toujours généré depuis un BDC)
  bdcId: string;
  bdcNumero: string;

  // Référence à la facture (optionnel - rempli quand le BDL est facturé)
  factureId?: string;

  // Informations client (dénormalisées depuis le BDC)
  clientId: string;
  clientNom: string; // Dénormalisé pour performance

  // CHAMPS SPÉCIFIQUES AU BDL
  dateLivraison: Date; // Date effective de livraison
  heureLivraison?: string; // Optionnel: "14:30"
  nomLivreur?: string; // Nom du transporteur/livreur
  observations?: string; // Notes de livraison
  signatureReception?: string; // Preuve de réception (texte pour MVP)

  // Lignes de livraison
  lignes: BdlLigne[];

  // Calculs financiers (basés sur quantiteLivree, pas quantiteCommandee)
  total: number; // Somme des prixTotal de toutes les lignes
  remisePourcentage: number; // 0 à 100
  remiseMontant: number; // Calculé depuis remisePourcentage
  totalNet: number; // total - remiseMontant

  // Statut et dates
  dateCreation: Date;
  dateModification?: Date;
  dateEnRoute?: Date; // Quand le BDL est passé en EN_ROUTE
  dateLivree?: Date; // Quand le BDL est passé en LIVRE
  dateAnnulation?: Date; // Quand le BDL a été annulé
  statut: BdlStatut;

  // Informations additionnelles
  notes?: string; // Notes internes

  // Informations de génération PDF
  lieu: string; // Ex: "Siguiri"
  fournisseur: string; // Ex: "Mr Balla TRAORE"
};

/**
 * Type pour la création d'un nouveau BDL
 */
export type CreateBdlInput = {
  bdcId: string;
  bdcNumero: string;
  clientId: string;
  clientNom: string;
  dateLivraison: Date;
  heureLivraison?: string;
  nomLivreur?: string;
  observations?: string;
  signatureReception?: string;
  lignes: Omit<BdlLigne, "numero" | "prixTotal">[]; // Doit inclure quantiteCommandee et quantiteLivree
  remisePourcentage?: number;
  notes?: string;
  lieu?: string; // Par défaut depuis BDC
  fournisseur?: string; // Par défaut depuis BDC
};

/**
 * Type pour la mise à jour d'un BDL (seulement BROUILLON)
 */
export type UpdateBdlInput = Partial<CreateBdlInput> & {
  id: string;
};

/**
 * Type pour changer le statut d'un BDL
 */
export type UpdateBdlStatutInput = {
  id: string;
  statut: BdlStatut;
  dateEnRoute?: Date;
  dateLivree?: Date;
  dateAnnulation?: Date;
};

/**
 * Type helper: Progression de livraison pour une ligne de BDC
 */
export type BdcLigneProgress = {
  ligneNumero: number;
  designation: string;
  unite: string;
  quantiteCommandee: number;
  quantiteTotaleLivree: number; // Somme de quantiteLivree de tous les BDL
  quantiteRestante: number; // quantiteCommandee - quantiteTotaleLivree
  pourcentageLivre: number; // (quantiteTotaleLivree / quantiteCommandee) * 100
};

/**
 * Type helper: Progression globale de livraison d'un BDC
 */
export type BdcDeliveryProgress = {
  bdcId: string;
  bdcNumero: string;
  lignesProgress: BdcLigneProgress[];
  pourcentageGlobalLivre: number; // Moyenne de tous les pourcentages
  estCompletementLivre: boolean; // Toutes les lignes à 100%
};
