/**
 * Type BDC (Bon De Commande) selon user-storie.md section 5
 */

export type BdcStatut = "BROUILLON" | "ENVOYE" | "APPROUVE" | "ANNULE";

/**
 * Ligne de BDC (article commandé)
 */
export type BdcLigne = {
  numero: number;
  designation: string;
  unite: string; // UN, KG, M, L, etc.
  quantite: number;
  prixUnitaire: number;
  prixTotal: number; // quantite * prixUnitaire (calculé automatiquement)
};

/**
 * Type BDC complet
 */
export type Bdc = {
  id: string;
  numero: string; // Format: "001/BDC/2025"

  // Référence au proforma source (optionnel si créé manuellement)
  proformaId?: string;
  proformaNumero?: string;

  // Informations client
  clientId: string;
  clientNom: string; // Dénormalisé pour performance

  // Dates
  dateCommande: Date; // Date de la commande client
  dateLivraisonSouhaitee?: string; // Texte libre (ex: "2 semaines")

  // Lignes de commande
  lignes: BdcLigne[];

  // Calculs financiers
  total: number; // Somme des prixTotal de toutes les lignes
  remisePourcentage: number; // 0 à 100
  remiseMontant: number; // Calculé depuis remisePourcentage
  totalNet: number; // total - remiseMontant

  // Statut et dates
  dateCreation: Date;
  dateModification?: Date;
  dateEnvoi?: Date; // Quand le BDC a été envoyé au client
  dateApprobation?: Date; // Quand le client a approuvé
  dateAnnulation?: Date; // Quand le BDC a été annulé
  statut: BdcStatut;

  // Informations additionnelles
  notes?: string; // Notes internes
  conditionsPaiement?: string; // Conditions de paiement

  // Informations de génération PDF
  lieu: string; // Ex: "Siguiri"
  fournisseur: string; // Ex: "Mr Balla TRAORE"
};

/**
 * Type pour la création d'un nouveau BDC
 */
export type CreateBdcInput = {
  proformaId?: string;
  proformaNumero?: string;
  clientId: string;
  clientNom: string;
  dateCommande: Date;
  dateLivraisonSouhaitee?: string;
  lignes: Omit<BdcLigne, "numero" | "prixTotal">[]; // Sans numero et prixTotal
  remisePourcentage?: number;
  notes?: string;
  conditionsPaiement?: string;
  lieu?: string; // Par défaut "Siguiri"
  fournisseur?: string; // Par défaut "Mr Balla TRAORE"
};

/**
 * Type pour la mise à jour d'un BDC (seulement BROUILLON)
 */
export type UpdateBdcInput = Partial<CreateBdcInput> & {
  id: string;
};

/**
 * Type pour changer le statut d'un BDC
 */
export type UpdateBdcStatutInput = {
  id: string;
  statut: BdcStatut;
  dateEnvoi?: Date;
  dateApprobation?: Date;
  dateAnnulation?: Date;
};
