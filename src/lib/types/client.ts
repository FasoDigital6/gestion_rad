/**
 * Type Client selon le cahier des charges RAD - Section 3
 */
export type Client = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ifu?: string; // Identifiant Fiscal Unique (optionnel)
  rccm?: string; // Registre de Commerce et du Crédit Mobilier (optionnel)
  dateCreation: Date;
  statut: "actif" | "inactif";

  // Statistiques financières du client (selon section 3 du cahier des charges)
  totalLivre: number; // Total des montants livrés
  totalFacture: number; // Total des montants facturés
  totalPaye: number; // Total des montants payés
  totalDu: number; // Montant restant dû (totalFacture - totalPaye)
};

/**
 * Type pour la création d'un nouveau client (sans id et stats)
 */
export type CreateClientInput = Omit<
  Client,
  "id" | "dateCreation" | "totalLivre" | "totalFacture" | "totalPaye" | "totalDu"
>;

/**
 * Type pour la mise à jour d'un client
 */
export type UpdateClientInput = Partial<CreateClientInput> & {
  id: string;
};
