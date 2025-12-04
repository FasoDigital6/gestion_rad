import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import {
  PAIEMENTS_COLLECTION_NAME,
  FACTURES_COLLECTION_NAME,
  CLIENTS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import type {
  Paiement,
  CreatePaiementInput,
  FacturePaiementsSummary,
} from "@/lib/types/paiement";
import { getFacture } from "./facture";
import { calculateFactureStatut } from "@/lib/utils/facture";

/**
 * Récupérer tous les paiements d'une facture
 */
export async function getPaiementsByFacture(
  factureId: string
): Promise<Paiement[]> {
  try {
    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const q = query(
      paiementsRef,
      where("factureId", "==", factureId),
      orderBy("datePaiement", "desc")
    );
    const querySnapshot = await getDocs(q);

    const paiements: Paiement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      paiements.push({
        id: doc.id,
        ...data,
        datePaiement: data.datePaiement?.toDate() || new Date(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
      } as Paiement);
    });

    return paiements;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements de la facture:",
      error
    );
    throw error;
  }
}

/**
 * Récupérer tous les paiements d'un client
 */
export async function getPaiementsByClient(
  clientId: string
): Promise<Paiement[]> {
  try {
    // Récupérer toutes les factures du client avec jointure
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const qFactures = query(
      facturesRef,
      where("clientId", "==", clientId)
    );
    const facturesSnapshot = await getDocs(qFactures);

    const factureIds: string[] = [];
    facturesSnapshot.forEach((doc) => {
      factureIds.push(doc.id);
    });

    if (factureIds.length === 0) {
      return [];
    }

    // Récupérer tous les paiements des factures du client
    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const qPaiements = query(
      paiementsRef,
      where("factureId", "in", factureIds),
      orderBy("datePaiement", "desc")
    );
    const paiementsSnapshot = await getDocs(qPaiements);

    const paiements: Paiement[] = [];
    paiementsSnapshot.forEach((doc) => {
      const data = doc.data();
      paiements.push({
        id: doc.id,
        ...data,
        datePaiement: data.datePaiement?.toDate() || new Date(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
      } as Paiement);
    });

    return paiements;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements du client:",
      error
    );
    throw error;
  }
}

/**
 * Récupérer un paiement par ID
 */
export async function getPaiement(id: string): Promise<Paiement> {
  try {
    const paiementRef = doc(db, PAIEMENTS_COLLECTION_NAME, id);
    const paiementDoc = await getDoc(paiementRef);

    if (!paiementDoc.exists()) {
      throw new Error("Paiement non trouvé");
    }

    const data = paiementDoc.data();
    return {
      id: paiementDoc.id,
      ...data,
      datePaiement: data.datePaiement?.toDate() || new Date(),
      dateCreation: data.dateCreation?.toDate() || new Date(),
    } as Paiement;
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement:", error);
    throw error;
  }
}

/**
 * Ajouter un paiement à une facture (TRANSACTION CRITIQUE)
 */
export async function addPaiement(
  input: CreatePaiementInput
): Promise<string> {
  try {
    // 1. Récupérer la facture
    const facture = await getFacture(input.factureId);

    // 2. Validations
    if (facture.statut === "ANNULEE") {
      throw new Error("Impossible d'ajouter un paiement à une facture annulée");
    }

    if (facture.statut === "PAYEE") {
      throw new Error("Cette facture est déjà payée intégralement");
    }

    if (input.montant <= 0) {
      throw new Error("Le montant du paiement doit être supérieur à 0");
    }

    if (input.montant > facture.soldeRestant) {
      throw new Error(
        `Le montant du paiement (${input.montant} FCFA) dépasse le solde restant (${facture.soldeRestant} FCFA)`
      );
    }

    // 3. Transaction atomique
    return await runTransaction(db, async (transaction) => {
      const factureRef = doc(db, FACTURES_COLLECTION_NAME, input.factureId);
      const clientRef = doc(db, CLIENTS_COLLECTION_NAME, facture.clientId);

      // IMPORTANT: Toutes les lectures doivent être faites AVANT les écritures
      const clientDoc = await transaction.get(clientRef);

      // Calculer les nouveaux totaux de la facture
      const newTotalPaye = facture.totalPaye + input.montant;
      const newSoldeRestant = facture.totalNet - newTotalPaye;

      // Calculer le nouveau statut
      const newStatut = calculateFactureStatut(
        facture.totalNet,
        newTotalPaye,
        facture.statut
      );

      // Préparer les données du paiement
      const paiementData = {
        factureId: input.factureId,
        factureNumero: facture.numero,
        montant: input.montant,
        modePaiement: input.modePaiement,
        datePaiement: Timestamp.fromDate(input.datePaiement),
        dateCreation: serverTimestamp(),
        referencePaiement: input.referencePaiement || null,
        banque: input.banque || null,
        notes: input.notes || null,
        recu: input.recu || null,
      };

      // Créer le paiement
      const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
      const paiementRef = doc(paiementsRef);
      transaction.set(paiementRef, paiementData);

      // Mettre à jour la facture
      const factureUpdateData: Record<string, unknown> = {
        totalPaye: newTotalPaye,
        soldeRestant: newSoldeRestant,
        statut: newStatut,
        dateModification: serverTimestamp(),
      };

      // Si passage à PAYEE, enregistrer la date
      if (newStatut === "PAYEE" && facture.statut !== "PAYEE") {
        factureUpdateData.datePayeeComplete = serverTimestamp();
      }

      transaction.update(factureRef, factureUpdateData);

      // Mettre à jour les totaux du client
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        transaction.update(clientRef, {
          totalPaye: (clientData.totalPaye || 0) + input.montant,
          totalDu: (clientData.totalDu || 0) - input.montant,
        });
      }

      return paiementRef.id;
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du paiement:", error);
    throw error;
  }
}

/**
 * Supprimer un paiement (ADMIN SEULEMENT - cas exceptionnel)
 */
export async function deletePaiement(id: string): Promise<void> {
  try {
    // 1. Récupérer le paiement
    const paiement = await getPaiement(id);

    // 2. Récupérer la facture
    const facture = await getFacture(paiement.factureId);

    // 3. Validation
    if (facture.statut === "ANNULEE") {
      throw new Error(
        "Impossible de supprimer un paiement d'une facture annulée"
      );
    }

    // 4. Transaction pour inverser les opérations
    await runTransaction(db, async (transaction) => {
      const paiementRef = doc(db, PAIEMENTS_COLLECTION_NAME, id);
      const factureRef = doc(db, FACTURES_COLLECTION_NAME, paiement.factureId);
      const clientRef = doc(db, CLIENTS_COLLECTION_NAME, facture.clientId);

      // IMPORTANT: Toutes les lectures doivent être faites AVANT les écritures
      const clientDoc = await transaction.get(clientRef);

      // Calculer les nouveaux totaux
      const newTotalPaye = facture.totalPaye - paiement.montant;
      const newSoldeRestant = facture.totalNet - newTotalPaye;

      // Recalculer le statut
      const newStatut = calculateFactureStatut(
        facture.totalNet,
        newTotalPaye,
        facture.statut
      );

      // Mettre à jour la facture
      const factureUpdateData: Record<string, unknown> = {
        totalPaye: newTotalPaye,
        soldeRestant: newSoldeRestant,
        statut: newStatut,
        dateModification: serverTimestamp(),
      };

      // Si on revient de PAYEE, retirer la date
      if (facture.statut === "PAYEE" && newStatut !== "PAYEE") {
        factureUpdateData.datePayeeComplete = null;
      }

      transaction.update(factureRef, factureUpdateData);

      // Mettre à jour les totaux du client
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        transaction.update(clientRef, {
          totalPaye: (clientData.totalPaye || 0) - paiement.montant,
          totalDu: (clientData.totalDu || 0) + paiement.montant,
        });
      }

      // Supprimer le paiement
      transaction.delete(paiementRef);
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement:", error);
    throw error;
  }
}

/**
 * Récupérer le résumé des paiements d'une facture
 */
export async function getFacturePaiementsSummary(
  factureId: string
): Promise<FacturePaiementsSummary> {
  try {
    const facture = await getFacture(factureId);
    const paiements = await getPaiementsByFacture(factureId);

    const statut =
      facture.statut === "EMISE" ||
      facture.statut === "PAYEE_PARTIELLE" ||
      facture.statut === "PAYEE"
        ? facture.statut
        : "EMISE";

    return {
      factureId: facture.id,
      factureNumero: facture.numero,
      totalNet: facture.totalNet,
      totalPaye: facture.totalPaye,
      soldeRestant: facture.soldeRestant,
      paiements,
      statut: statut as "EMISE" | "PAYEE_PARTIELLE" | "PAYEE",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du résumé des paiements:",
      error
    );
    throw error;
  }
}
