/**
 * Type Proforma selon le cahier des charges RAD - Section Proformas & Appels d'Offres
 */

export type ProformaStatut = "BROUILLON" | "ENVOYE" | "VALIDE" | "REJETE";

/**
 * Ligne de proforma (article)
 */
export type ProformaLigne = {
  numero: number;
  designation: string;
  unite: string; // UN, KG, M, L, etc.
  quantite: number;
  prixUnitaire: number;
  prixTotal: number; // quantite * prixUnitaire (calculé automatiquement)
};

/**
 * Type Proforma complet
 */
export type Proforma = {
  id: string;
  numero: string; // Format: "009/RAD/2025"
  numeroDA: string; // Numéro d'appel d'offres (ex: "DA2507SIM099")
  clientId: string;
  clientNom: string; // Dénormalisé pour performance (ex: "PROJET SIMANDOU")

  dateLivraison: string; // Texte libre (ex: "2 semaines après la réception de la Commande")

  lignes: ProformaLigne[];

  // Calculs financiers
  total: number; // Somme des prixTotal de toutes les lignes
  remisePourcentage: number; // 0 à 100
  remiseMontant: number; // Calculé depuis remisePourcentage
  totalNet: number; // total - remiseMontant

  // Dates et statut
  dateCreation: Date;
  dateModification?: Date;
  dateEnvoi?: Date; // Quand le proforma a été envoyé au client
  dateValidation?: Date; // Quand le client a validé
  statut: ProformaStatut;

  // Informations de génération PDF
  lieu: string; // Ex: "Siguiri"
  fournisseur: string; // Ex: "Mr Balla TRAORE"
};

/**
 * Type pour la création d'un nouveau proforma
 */
export type CreateProformaInput = {
  numeroDA: string;
  clientId: string;
  clientNom: string;
  dateLivraison: string;
  lignes: Omit<ProformaLigne, "numero" | "prixTotal">[]; // Sans numero et prixTotal
  remisePourcentage?: number;
  lieu?: string; // Par défaut "Siguiri"
  fournisseur?: string; // Par défaut "Mr Balla TRAORE"
};

/**
 * Type pour la mise à jour d'un proforma (seulement BROUILLON)
 */
export type UpdateProformaInput = Partial<CreateProformaInput> & {
  id: string;
};

/**
 * Type pour changer le statut d'un proforma
 */
export type UpdateProformaStatutInput = {
  id: string;
  statut: ProformaStatut;
  dateEnvoi?: Date;
  dateValidation?: Date;
};
