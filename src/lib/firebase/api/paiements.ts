/**
 * API Firebase pour les Paiements
 * Selon le cahier des charges RAD - Section 8
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import { PAIEMENTS_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import {
  Paiement,
  CreatePaiementInput,
  UpdatePaiementInput,
  StatutPaiement,
  HistoriqueAction,
  ReferenceDocument,
  RecapitulatifPaiementsFacture,
} from "@/lib/types";
import { getFacture, enregistrerPaiementFacture } from "./factures";

/**
 * Générer un numéro de paiement unique
 */
async function genererNumeroPaiement(): Promise<string> {
  const year = new Date().getFullYear();
  const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
  const q = query(
    paiementsRef,
    where("numero", ">=", `PAY-${year}-`),
    where("numero", "<", `PAY-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `PAY-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `PAY-${year}-${nouveauIncrement}`;
}

/**
 * Créer une action d'historique
 */
function creerActionHistorique(
  action: string,
  utilisateur: string,
  details?: string
): HistoriqueAction {
  return {
    id: crypto.randomUUID(),
    action,
    utilisateur,
    date: new Date(),
    details,
  };
}

/**
 * Récupérer tous les paiements
 */
export async function getPaiements(): Promise<Paiement[]> {
  try {
    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const q = query(paiementsRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const paiements: Paiement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      paiements.push({
        id: doc.id,
        numero: data.numero,
        factureId: data.factureId,
        factureNumero: data.factureNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        datePaiement: data.datePaiement?.toDate() || new Date(),
        dateValeur: data.dateValeur?.toDate(),
        montant: data.montant || 0,
        montantFacture: data.montantFacture || 0,
        montantRestant: data.montantRestant || 0,
        modePaiement: data.modePaiement,
        reference: data.reference,
        banque: data.banque,
        notes: data.notes,
        statut: data.statut,
        justificatifs: data.justificatifs || [],
        historique: data.historique || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return paiements;
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    throw new Error("Impossible de récupérer les paiements");
  }
}

/**
 * Récupérer un paiement par son ID
 */
export async function getPaiement(id: string): Promise<Paiement> {
  try {
    const paiementDoc = doc(db, PAIEMENTS_COLLECTION_NAME, id);
    const paiementSnapshot = await getDoc(paiementDoc);

    if (!paiementSnapshot.exists()) {
      throw new Error("Paiement introuvable");
    }

    const data = paiementSnapshot.data();
    return {
      id: paiementSnapshot.id,
      numero: data.numero,
      factureId: data.factureId,
      factureNumero: data.factureNumero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      datePaiement: data.datePaiement?.toDate() || new Date(),
      dateValeur: data.dateValeur?.toDate(),
      montant: data.montant || 0,
      montantFacture: data.montantFacture || 0,
      montantRestant: data.montantRestant || 0,
      modePaiement: data.modePaiement,
      reference: data.reference,
      banque: data.banque,
      notes: data.notes,
      statut: data.statut,
      justificatifs: data.justificatifs || [],
      historique: data.historique || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du paiement:", error);
    throw new Error("Impossible de récupérer le paiement");
  }
}

/**
 * Récupérer les paiements d'une facture
 */
export async function getPaiementsByFacture(
  factureId: string
): Promise<Paiement[]> {
  try {
    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const q = query(
      paiementsRef,
      where("factureId", "==", factureId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const paiements: Paiement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      paiements.push({
        id: doc.id,
        numero: data.numero,
        factureId: data.factureId,
        factureNumero: data.factureNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        datePaiement: data.datePaiement?.toDate() || new Date(),
        dateValeur: data.dateValeur?.toDate(),
        montant: data.montant || 0,
        montantFacture: data.montantFacture || 0,
        montantRestant: data.montantRestant || 0,
        modePaiement: data.modePaiement,
        reference: data.reference,
        banque: data.banque,
        notes: data.notes,
        statut: data.statut,
        justificatifs: data.justificatifs || [],
        historique: data.historique || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return paiements;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements de la facture:",
      error
    );
    throw new Error("Impossible de récupérer les paiements de la facture");
  }
}

/**
 * Récupérer les paiements d'un client
 */
export async function getPaiementsByClient(clientId: string): Promise<Paiement[]> {
  try {
    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const q = query(
      paiementsRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const paiements: Paiement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      paiements.push({
        id: doc.id,
        numero: data.numero,
        factureId: data.factureId,
        factureNumero: data.factureNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        datePaiement: data.datePaiement?.toDate() || new Date(),
        dateValeur: data.dateValeur?.toDate(),
        montant: data.montant || 0,
        montantFacture: data.montantFacture || 0,
        montantRestant: data.montantRestant || 0,
        modePaiement: data.modePaiement,
        reference: data.reference,
        banque: data.banque,
        notes: data.notes,
        statut: data.statut,
        justificatifs: data.justificatifs || [],
        historique: data.historique || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return paiements;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements du client:",
      error
    );
    throw new Error("Impossible de récupérer les paiements du client");
  }
}

/**
 * Créer un nouveau paiement
 */
export async function createPaiement(
  paiementData: CreatePaiementInput,
  userId: string
): Promise<string> {
  try {
    // Récupérer la facture
    const facture = await getFacture(paiementData.factureId);

    // Vérifier que le montant ne dépasse pas le montant restant
    if (paiementData.montant > facture.montantRestant) {
      throw new Error(
        `Le montant du paiement (${paiementData.montant}) dépasse le montant restant de la facture (${facture.montantRestant})`
      );
    }

    // Générer le numéro de paiement
    const numero = await genererNumeroPaiement();

    // Calculer le nouveau montant restant
    const nouveauMontantRestant = facture.montantRestant - paiementData.montant;

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création du paiement"),
      creerActionHistorique(
        "enregistrement",
        userId,
        `Paiement de ${paiementData.montant} FCFA reçu par ${paiementData.modePaiement}`
      ),
    ];

    const paiementsRef = collection(db, PAIEMENTS_COLLECTION_NAME);
    const docRef = await addDoc(paiementsRef, {
      numero,
      factureId: paiementData.factureId,
      factureNumero: facture.numero,
      clientId: facture.clientId,
      clientNom: facture.clientNom,
      dateCreation: serverTimestamp(),
      datePaiement: Timestamp.fromDate(paiementData.datePaiement),
      dateValeur: paiementData.dateValeur
        ? Timestamp.fromDate(paiementData.dateValeur)
        : null,
      montant: paiementData.montant,
      montantFacture: facture.totalTTC,
      montantRestant: nouveauMontantRestant,
      modePaiement: paiementData.modePaiement,
      reference: paiementData.reference,
      banque: paiementData.banque,
      notes: paiementData.notes,
      statut: "valide" as StatutPaiement,
      justificatifs: [],
      historique,
      creePar: userId,
    });

    // Enregistrer le paiement sur la facture
    const paiementRef: ReferenceDocument = {
      id: docRef.id,
      numero,
      type: "bl", // TODO: créer un type "paiement" dans ReferenceDocument
      date: paiementData.datePaiement,
    };

    await enregistrerPaiementFacture(
      paiementData.factureId,
      paiementRef,
      paiementData.montant,
      userId
    );

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du paiement:", error);
    throw new Error("Impossible de créer le paiement");
  }
}

/**
 * Mettre à jour un paiement
 */
export async function updatePaiement(
  paiementData: UpdatePaiementInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = paiementData;
    const paiementDoc = doc(db, PAIEMENTS_COLLECTION_NAME, id);

    // Vérifier que le paiement existe
    const paiementSnapshot = await getDoc(paiementDoc);
    if (!paiementSnapshot.exists()) {
      throw new Error("Paiement introuvable");
    }

    // Ne pas permettre la modification du montant si le paiement est validé
    if (
      paiementSnapshot.data().statut === "valide" &&
      updateData.montant !== undefined
    ) {
      throw new Error(
        "Impossible de modifier le montant d'un paiement validé"
      );
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    if (updateData.datePaiement)
      dataToUpdate.datePaiement = Timestamp.fromDate(updateData.datePaiement);
    if (updateData.dateValeur)
      dataToUpdate.dateValeur = Timestamp.fromDate(updateData.dateValeur);
    if (updateData.modePaiement !== undefined)
      dataToUpdate.modePaiement = updateData.modePaiement;
    if (updateData.reference !== undefined)
      dataToUpdate.reference = updateData.reference;
    if (updateData.banque !== undefined) dataToUpdate.banque = updateData.banque;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const currentHistorique = paiementSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "modification",
      userId,
      "Modification du paiement"
    );
    dataToUpdate.historique = [...currentHistorique, nouvelleAction];

    await updateDoc(paiementDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement:", error);
    throw new Error("Impossible de mettre à jour le paiement");
  }
}

/**
 * Changer le statut d'un paiement
 */
export async function changerStatutPaiement(
  id: string,
  statut: StatutPaiement,
  userId: string
): Promise<void> {
  try {
    const paiementDoc = doc(db, PAIEMENTS_COLLECTION_NAME, id);
    const paiementSnapshot = await getDoc(paiementDoc);

    if (!paiementSnapshot.exists()) {
      throw new Error("Paiement introuvable");
    }

    const currentHistorique = paiementSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "changement_statut",
      userId,
      `Statut changé en: ${statut}`
    );

    await updateDoc(paiementDoc, {
      statut,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du paiement");
  }
}

/**
 * Supprimer un paiement (uniquement si statut = "en_attente" ou "annule")
 */
export async function deletePaiement(id: string): Promise<void> {
  try {
    const paiement = await getPaiement(id);

    if (paiement.statut === "valide") {
      throw new Error(
        "Impossible de supprimer un paiement validé. Annulez-le d'abord."
      );
    }

    const paiementDoc = doc(db, PAIEMENTS_COLLECTION_NAME, id);
    await deleteDoc(paiementDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du paiement:", error);
    throw new Error("Impossible de supprimer le paiement");
  }
}

/**
 * Récupérer le récapitulatif des paiements d'une facture
 */
export async function getRecapitulatifPaiementsFacture(
  factureId: string
): Promise<RecapitulatifPaiementsFacture> {
  try {
    const facture = await getFacture(factureId);
    const paiements = await getPaiementsByFacture(factureId);

    // Calculer si la facture est en retard
    const aujourdhui = new Date();
    const estEnRetard =
      facture.montantRestant > 0 && facture.dateEcheance < aujourdhui;

    let joursRetard: number | undefined;
    if (estEnRetard) {
      const diffTime = Math.abs(
        aujourdhui.getTime() - facture.dateEcheance.getTime()
      );
      joursRetard = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      factureId: facture.id,
      factureNumero: facture.numero,
      montantTotal: facture.totalTTC,
      montantPaye: facture.montantPaye,
      montantRestant: facture.montantRestant,
      paiements: paiements.map((p) => ({
        id: p.id,
        numero: p.numero,
        datePaiement: p.datePaiement,
        montant: p.montant,
        modePaiement: p.modePaiement,
        statut: p.statut,
      })),
      estPayeCompletement: facture.montantRestant <= 0,
      estPayePartiellement:
        facture.montantPaye > 0 && facture.montantRestant > 0,
      estEnRetard,
      joursRetard,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du récapitulatif:",
      error
    );
    throw new Error("Impossible de récupérer le récapitulatif des paiements");
  }
}
