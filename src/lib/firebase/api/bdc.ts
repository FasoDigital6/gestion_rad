/**
 * API Firebase pour les Bons de Commande (BDC)
 * Selon le cahier des charges RAD - Section 5
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
import {
  BDC_COLLECTION_NAME,
  PROFORMAS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import {
  BonDeCommande,
  CreateBDCInput,
  UpdateBDCInput,
  LigneDocument,
  CreateLigneInput,
  StatutBDC,
  HistoriqueAction,
  ReferenceDocument,
} from "@/lib/types";
import { getClient } from "./clients";
import { getProforma, lierBDCauProforma } from "./proformas";

/**
 * Générer un numéro de BDC unique
 */
async function genererNumeroBDC(): Promise<string> {
  const year = new Date().getFullYear();
  const bdcRef = collection(db, BDC_COLLECTION_NAME);
  const q = query(
    bdcRef,
    where("numero", ">=", `BDC-${year}-`),
    where("numero", "<", `BDC-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `BDC-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `BDC-${year}-${nouveauIncrement}`;
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
 * Calculer les totaux
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
 * Récupérer tous les BDC
 */
export async function getBDCs(): Promise<BonDeCommande[]> {
  try {
    const bdcRef = collection(db, BDC_COLLECTION_NAME);
    const q = query(bdcRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const bdcs: BonDeCommande[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdcs.push({
        id: doc.id,
        numero: data.numero,
        numeroBDCClient: data.numeroBDCClient,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateCommande: data.dateCommande?.toDate() || new Date(),
        dateReception: data.dateReception?.toDate() || new Date(),
        proformaId: data.proformaId,
        proformaNumero: data.proformaNumero,
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        bdcClientPDF: data.bdcClientPDF,
        sourceCreation: data.sourceCreation,
        bls: data.bls || [],
        factures: data.factures || [],
        quantiteCommandee: data.quantiteCommandee || 0,
        quantiteLivree: data.quantiteLivree || 0,
        quantiteFacturee: data.quantiteFacturee || 0,
        quantiteRestante: data.quantiteRestante || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bdcs;
  } catch (error) {
    console.error("Erreur lors de la récupération des BDC:", error);
    throw new Error("Impossible de récupérer les BDC");
  }
}

/**
 * Récupérer un BDC par son ID
 */
export async function getBDC(id: string): Promise<BonDeCommande> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);
    const bdcSnapshot = await getDoc(bdcDoc);

    if (!bdcSnapshot.exists()) {
      throw new Error("BDC introuvable");
    }

    const data = bdcSnapshot.data();
    return {
      id: bdcSnapshot.id,
      numero: data.numero,
      numeroBDCClient: data.numeroBDCClient,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateCommande: data.dateCommande?.toDate() || new Date(),
      dateReception: data.dateReception?.toDate() || new Date(),
      proformaId: data.proformaId,
      proformaNumero: data.proformaNumero,
      lignes: data.lignes || [],
      totalHT: data.totalHT || 0,
      totalTVA: data.totalTVA || 0,
      totalTTC: data.totalTTC || 0,
      statut: data.statut,
      notes: data.notes,
      bdcClientPDF: data.bdcClientPDF,
      sourceCreation: data.sourceCreation,
      bls: data.bls || [],
      factures: data.factures || [],
      quantiteCommandee: data.quantiteCommandee || 0,
      quantiteLivree: data.quantiteLivree || 0,
      quantiteFacturee: data.quantiteFacturee || 0,
      quantiteRestante: data.quantiteRestante || 0,
      historique: data.historique || [],
      piecesJointes: data.piecesJointes || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du BDC:", error);
    throw new Error("Impossible de récupérer le BDC");
  }
}

/**
 * Récupérer les BDC d'un client
 */
export async function getBDCsByClient(clientId: string): Promise<BonDeCommande[]> {
  try {
    const bdcRef = collection(db, BDC_COLLECTION_NAME);
    const q = query(
      bdcRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bdcs: BonDeCommande[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdcs.push({
        id: doc.id,
        numero: data.numero,
        numeroBDCClient: data.numeroBDCClient,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateCommande: data.dateCommande?.toDate() || new Date(),
        dateReception: data.dateReception?.toDate() || new Date(),
        proformaId: data.proformaId,
        proformaNumero: data.proformaNumero,
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        bdcClientPDF: data.bdcClientPDF,
        sourceCreation: data.sourceCreation,
        bls: data.bls || [],
        factures: data.factures || [],
        quantiteCommandee: data.quantiteCommandee || 0,
        quantiteLivree: data.quantiteLivree || 0,
        quantiteFacturee: data.quantiteFacturee || 0,
        quantiteRestante: data.quantiteRestante || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bdcs;
  } catch (error) {
    console.error("Erreur lors de la récupération des BDC du client:", error);
    throw new Error("Impossible de récupérer les BDC du client");
  }
}

/**
 * Créer un nouveau BDC
 */
export async function createBDC(
  bdcData: CreateBDCInput,
  userId: string
): Promise<string> {
  try {
    // Récupérer les infos du client
    const client = await getClient(bdcData.clientId);

    // Générer le numéro de BDC
    const numero = await genererNumeroBDC();

    // Calculer les lignes avec montants
    const lignes = bdcData.lignes.map(calculerMontantsLigne);

    // Calculer les totaux
    const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);

    // Calculer la quantité totale commandée
    const quantiteCommandee = lignes.reduce(
      (sum, ligne) => sum + ligne.quantite,
      0
    );

    // Préparer les données pour le proforma si applicable
    let proformaNumero: string | undefined;
    if (bdcData.proformaId) {
      const proforma = await getProforma(bdcData.proformaId);
      proformaNumero = proforma.numero;
    }

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création du BDC"),
    ];

    if (bdcData.proformaId) {
      historique.push(
        creerActionHistorique(
          "liaison_proforma",
          userId,
          `BDC créé depuis le proforma ${proformaNumero}`
        )
      );
    }

    const bdcRef = collection(db, BDC_COLLECTION_NAME);
    const docRef = await addDoc(bdcRef, {
      numero,
      numeroBDCClient: bdcData.numeroBDCClient,
      clientId: bdcData.clientId,
      clientNom: client.nom,
      dateCreation: serverTimestamp(),
      dateCommande: Timestamp.fromDate(bdcData.dateCommande),
      dateReception: serverTimestamp(),
      proformaId: bdcData.proformaId,
      proformaNumero,
      lignes,
      totalHT,
      totalTVA,
      totalTTC,
      statut: "recu" as StatutBDC,
      notes: bdcData.notes,
      bdcClientPDF: bdcData.bdcClientPDF,
      sourceCreation: bdcData.sourceCreation,
      bls: [],
      factures: [],
      quantiteCommandee,
      quantiteLivree: 0,
      quantiteFacturee: 0,
      quantiteRestante: quantiteCommandee,
      historique,
      piecesJointes: [],
      creePar: userId,
    });

    // Si créé depuis un proforma, lier le BDC au proforma
    if (bdcData.proformaId) {
      await lierBDCauProforma(bdcData.proformaId, docRef.id, numero, userId);
    }

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du BDC:", error);
    throw new Error("Impossible de créer le BDC");
  }
}

/**
 * Mettre à jour un BDC
 */
export async function updateBDC(
  bdcData: UpdateBDCInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = bdcData;
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    // Si les lignes sont modifiées, recalculer les montants et quantités
    if (updateData.lignes) {
      const lignes = updateData.lignes.map(calculerMontantsLigne);
      const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);
      const quantiteCommandee = lignes.reduce(
        (sum, ligne) => sum + ligne.quantite,
        0
      );

      // Récupérer les quantités livrées/facturées actuelles
      const bdcSnapshot = await getDoc(bdcDoc);
      if (bdcSnapshot.exists()) {
        const currentData = bdcSnapshot.data();
        const quantiteLivree = currentData.quantiteLivree || 0;
        const quantiteRestante = quantiteCommandee - quantiteLivree;

        dataToUpdate.lignes = lignes;
        dataToUpdate.totalHT = totalHT;
        dataToUpdate.totalTVA = totalTVA;
        dataToUpdate.totalTTC = totalTTC;
        dataToUpdate.quantiteCommandee = quantiteCommandee;
        dataToUpdate.quantiteRestante = quantiteRestante;
      }
    }

    // Ajouter les autres champs
    if (updateData.numeroBDCClient !== undefined)
      dataToUpdate.numeroBDCClient = updateData.numeroBDCClient;
    if (updateData.dateCommande)
      dataToUpdate.dateCommande = Timestamp.fromDate(updateData.dateCommande);
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;
    if (updateData.bdcClientPDF !== undefined)
      dataToUpdate.bdcClientPDF = updateData.bdcClientPDF;

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const bdcSnapshot = await getDoc(bdcDoc);
    if (bdcSnapshot.exists()) {
      const currentHistorique = bdcSnapshot.data().historique || [];
      const nouvelleAction = creerActionHistorique(
        "modification",
        userId,
        "Modification du BDC"
      );
      dataToUpdate.historique = [...currentHistorique, nouvelleAction];
    }

    await updateDoc(bdcDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du BDC:", error);
    throw new Error("Impossible de mettre à jour le BDC");
  }
}

/**
 * Changer le statut d'un BDC
 */
export async function changerStatutBDC(
  id: string,
  statut: StatutBDC,
  userId: string
): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);
    const bdcSnapshot = await getDoc(bdcDoc);

    if (!bdcSnapshot.exists()) {
      throw new Error("BDC introuvable");
    }

    const currentHistorique = bdcSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "changement_statut",
      userId,
      `Statut changé en: ${statut}`
    );

    await updateDoc(bdcDoc, {
      statut,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du BDC");
  }
}

/**
 * Supprimer un BDC
 */
export async function deleteBDC(id: string): Promise<void> {
  try {
    // Vérifier que le BDC n'a pas de BL liés
    const bdc = await getBDC(id);
    if (bdc.bls.length > 0) {
      throw new Error(
        "Impossible de supprimer un BDC lié à des bons de livraison"
      );
    }

    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);
    await deleteDoc(bdcDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du BDC:", error);
    throw new Error("Impossible de supprimer le BDC");
  }
}

/**
 * Mettre à jour les quantités livrées/facturées d'un BDC
 * Cette fonction est appelée lors de la création de BL ou de factures
 */
export async function mettreAJourQuantitesBDC(
  bdcId: string,
  quantiteLivree?: number,
  quantiteFacturee?: number,
  userId?: string
): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, bdcId);
    const bdcSnapshot = await getDoc(bdcDoc);

    if (!bdcSnapshot.exists()) {
      throw new Error("BDC introuvable");
    }

    const data = bdcSnapshot.data();
    const updateData: any = {
      dateModification: serverTimestamp(),
    };

    if (quantiteLivree !== undefined) {
      const nouvelleQuantiteLivree =
        (data.quantiteLivree || 0) + quantiteLivree;
      updateData.quantiteLivree = nouvelleQuantiteLivree;
      updateData.quantiteRestante =
        data.quantiteCommandee - nouvelleQuantiteLivree;

      // Mettre à jour le statut si toutes les quantités sont livrées
      if (updateData.quantiteRestante <= 0) {
        updateData.statut = "termine";
      } else if (nouvelleQuantiteLivree > 0) {
        updateData.statut = "en_cours";
      }
    }

    if (quantiteFacturee !== undefined) {
      updateData.quantiteFacturee =
        (data.quantiteFacturee || 0) + quantiteFacturee;
    }

    if (userId) {
      updateData.modifiePar = userId;
    }

    await updateDoc(bdcDoc, updateData);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des quantités du BDC:",
      error
    );
    throw new Error("Impossible de mettre à jour les quantités du BDC");
  }
}

/**
 * Ajouter une référence de BL à un BDC
 */
export async function ajouterBLauBDC(
  bdcId: string,
  blRef: ReferenceDocument,
  userId: string
): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, bdcId);
    const bdcSnapshot = await getDoc(bdcDoc);

    if (!bdcSnapshot.exists()) {
      throw new Error("BDC introuvable");
    }

    const currentBLs = bdcSnapshot.data().bls || [];
    const currentHistorique = bdcSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "ajout_bl",
      userId,
      `BL ${blRef.numero} ajouté`
    );

    await updateDoc(bdcDoc, {
      bls: [...currentBLs, blRef],
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du BL au BDC:", error);
    throw new Error("Impossible d'ajouter le BL au BDC");
  }
}

/**
 * Ajouter une référence de facture à un BDC
 */
export async function ajouterFactureauBDC(
  bdcId: string,
  factureRef: ReferenceDocument,
  userId: string
): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, bdcId);
    const bdcSnapshot = await getDoc(bdcDoc);

    if (!bdcSnapshot.exists()) {
      throw new Error("BDC introuvable");
    }

    const currentFactures = bdcSnapshot.data().factures || [];
    const currentHistorique = bdcSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "ajout_facture",
      userId,
      `Facture ${factureRef.numero} ajoutée`
    );

    await updateDoc(bdcDoc, {
      factures: [...currentFactures, factureRef],
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la facture au BDC:", error);
    throw new Error("Impossible d'ajouter la facture au BDC");
  }
}
