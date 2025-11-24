/**
 * API Firebase pour les Proformas
 * Selon le cahier des charges RAD - Section 4
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
import { PROFORMAS_COLLECTION_NAME, CLIENTS_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import {
  Proforma,
  CreateProformaInput,
  UpdateProformaInput,
  LigneDocument,
  CreateLigneInput,
  StatutProforma,
  HistoriqueAction,
} from "@/lib/types";
import { getClient } from "./clients";

/**
 * Générer un numéro de proforma unique
 */
async function genererNumeroProforma(): Promise<string> {
  const year = new Date().getFullYear();
  const proformasRef = collection(db, PROFORMAS_COLLECTION_NAME);
  const q = query(
    proformasRef,
    where("numero", ">=", `PRO-${year}-`),
    where("numero", "<", `PRO-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `PRO-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `PRO-${year}-${nouveauIncrement}`;
}

/**
 * Calculer les montants d'une ligne
 */
function calculerMontantsLigne(ligne: CreateLigneInput): LigneDocument {
  const montantHT = ligne.quantite * ligne.prixUnitaire;
  const montantTVA = ligne.tva ? (montantHT * ligne.tva) / 100 : 0;
  const montantTTC = montantHT + montantTVA;

  return {
    id: crypto.randomUUID(),
    designation: ligne.designation,
    quantite: ligne.quantite,
    unite: ligne.unite,
    prixUnitaire: ligne.prixUnitaire,
    montantHT,
    tva: ligne.tva,
    montantTTC,
    notes: ligne.notes,
  };
}

/**
 * Calculer les totaux d'un proforma
 */
function calculerTotaux(lignes: LigneDocument[]): {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
} {
  const totalHT = lignes.reduce((sum, ligne) => sum + ligne.montantHT, 0);
  const totalTVA = lignes.reduce(
    (sum, ligne) => sum + (ligne.montantTTC! - ligne.montantHT),
    0
  );
  const totalTTC = lignes.reduce((sum, ligne) => sum + ligne.montantTTC!, 0);

  return { totalHT, totalTVA, totalTTC };
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
 * Récupérer tous les proformas
 */
export async function getProformas(): Promise<Proforma[]> {
  try {
    const proformasRef = collection(db, PROFORMAS_COLLECTION_NAME);
    const q = query(proformasRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const proformas: Proforma[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      proformas.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateValidite: data.dateValidite?.toDate() || new Date(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        conditions: data.conditions,
        appelOffre: data.appelOffre,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        templatePDF: data.templatePDF,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return proformas;
  } catch (error) {
    console.error("Erreur lors de la récupération des proformas:", error);
    throw new Error("Impossible de récupérer les proformas");
  }
}

/**
 * Récupérer un proforma par son ID
 */
export async function getProforma(id: string): Promise<Proforma> {
  try {
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);
    const proformaSnapshot = await getDoc(proformaDoc);

    if (!proformaSnapshot.exists()) {
      throw new Error("Proforma introuvable");
    }

    const data = proformaSnapshot.data();
    return {
      id: proformaSnapshot.id,
      numero: data.numero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateValidite: data.dateValidite?.toDate() || new Date(),
      dateEnvoi: data.dateEnvoi?.toDate(),
      lignes: data.lignes || [],
      totalHT: data.totalHT || 0,
      totalTVA: data.totalTVA || 0,
      totalTTC: data.totalTTC || 0,
      statut: data.statut,
      notes: data.notes,
      conditions: data.conditions,
      appelOffre: data.appelOffre,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      templatePDF: data.templatePDF,
      historique: data.historique || [],
      piecesJointes: data.piecesJointes || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du proforma:", error);
    throw new Error("Impossible de récupérer le proforma");
  }
}

/**
 * Récupérer les proformas d'un client
 */
export async function getProformasByClient(clientId: string): Promise<Proforma[]> {
  try {
    const proformasRef = collection(db, PROFORMAS_COLLECTION_NAME);
    const q = query(
      proformasRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const proformas: Proforma[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      proformas.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateValidite: data.dateValidite?.toDate() || new Date(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        conditions: data.conditions,
        appelOffre: data.appelOffre,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        templatePDF: data.templatePDF,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return proformas;
  } catch (error) {
    console.error("Erreur lors de la récupération des proformas du client:", error);
    throw new Error("Impossible de récupérer les proformas du client");
  }
}

/**
 * Créer un nouveau proforma
 */
export async function createProforma(
  proformaData: CreateProformaInput,
  userId: string
): Promise<string> {
  try {
    // Récupérer les infos du client
    const client = await getClient(proformaData.clientId);

    // Générer le numéro de proforma
    const numero = await genererNumeroProforma();

    // Calculer les lignes avec montants
    const lignes = proformaData.lignes.map(calculerMontantsLigne);

    // Calculer les totaux
    const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création du proforma"),
    ];

    const proformasRef = collection(db, PROFORMAS_COLLECTION_NAME);
    const docRef = await addDoc(proformasRef, {
      numero,
      clientId: proformaData.clientId,
      clientNom: client.nom,
      dateCreation: serverTimestamp(),
      dateValidite: Timestamp.fromDate(proformaData.dateValidite),
      lignes,
      totalHT,
      totalTVA,
      totalTTC,
      statut: "brouillon" as StatutProforma,
      notes: proformaData.notes,
      conditions: proformaData.conditions,
      appelOffre: proformaData.appelOffre
        ? {
            ...proformaData.appelOffre,
            dateImport: serverTimestamp(),
          }
        : undefined,
      templatePDF: proformaData.templatePDF || "standard",
      historique,
      piecesJointes: [],
      creePar: userId,
    });

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du proforma:", error);
    throw new Error("Impossible de créer le proforma");
  }
}

/**
 * Mettre à jour un proforma
 */
export async function updateProforma(
  proformaData: UpdateProformaInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = proformaData;
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    // Si les lignes sont modifiées, recalculer les montants
    if (updateData.lignes) {
      const lignes = updateData.lignes.map(calculerMontantsLigne);
      const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);
      dataToUpdate.lignes = lignes;
      dataToUpdate.totalHT = totalHT;
      dataToUpdate.totalTVA = totalTVA;
      dataToUpdate.totalTTC = totalTTC;
    }

    // Ajouter les autres champs
    if (updateData.dateValidite) {
      dataToUpdate.dateValidite = Timestamp.fromDate(updateData.dateValidite);
    }
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.conditions !== undefined)
      dataToUpdate.conditions = updateData.conditions;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;
    if (updateData.templatePDF !== undefined)
      dataToUpdate.templatePDF = updateData.templatePDF;

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const proformaSnapshot = await getDoc(proformaDoc);
    if (proformaSnapshot.exists()) {
      const currentHistorique = proformaSnapshot.data().historique || [];
      const nouvelleAction = creerActionHistorique(
        "modification",
        userId,
        "Modification du proforma"
      );
      dataToUpdate.historique = [...currentHistorique, nouvelleAction];
    }

    await updateDoc(proformaDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du proforma:", error);
    throw new Error("Impossible de mettre à jour le proforma");
  }
}

/**
 * Changer le statut d'un proforma
 */
export async function changerStatutProforma(
  id: string,
  statut: StatutProforma,
  userId: string
): Promise<void> {
  try {
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);
    const proformaSnapshot = await getDoc(proformaDoc);

    if (!proformaSnapshot.exists()) {
      throw new Error("Proforma introuvable");
    }

    const currentHistorique = proformaSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "changement_statut",
      userId,
      `Statut changé en: ${statut}`
    );

    const updateData: any = {
      statut,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    // Si le statut est "envoye", enregistrer la date d'envoi
    if (statut === "envoye") {
      updateData.dateEnvoi = serverTimestamp();
    }

    await updateDoc(proformaDoc, updateData);
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du proforma");
  }
}

/**
 * Supprimer un proforma
 */
export async function deleteProforma(id: string): Promise<void> {
  try {
    // Vérifier que le proforma n'a pas de BDC lié
    const proforma = await getProforma(id);
    if (proforma.bdcId) {
      throw new Error(
        "Impossible de supprimer un proforma lié à un bon de commande"
      );
    }

    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);
    await deleteDoc(proformaDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du proforma:", error);
    throw new Error("Impossible de supprimer le proforma");
  }
}

/**
 * Lier un BDC à un proforma
 */
export async function lierBDCauProforma(
  proformaId: string,
  bdcId: string,
  bdcNumero: string,
  userId: string
): Promise<void> {
  try {
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, proformaId);
    const proformaSnapshot = await getDoc(proformaDoc);

    if (!proformaSnapshot.exists()) {
      throw new Error("Proforma introuvable");
    }

    const currentHistorique = proformaSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "liaison_bdc",
      userId,
      `BDC ${bdcNumero} créé à partir de ce proforma`
    );

    await updateDoc(proformaDoc, {
      bdcId,
      bdcNumero,
      statut: "accepte",
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors de la liaison du BDC:", error);
    throw new Error("Impossible de lier le BDC au proforma");
  }
}
