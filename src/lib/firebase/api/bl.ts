/**
 * API Firebase pour les Bons de Livraison (BL)
 * Selon le cahier des charges RAD - Section 6
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
import { BL_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import {
  BonDeLivraison,
  CreateBLInput,
  UpdateBLInput,
  LigneDocument,
  CreateLigneInput,
  StatutBL,
  HistoriqueAction,
  ReferenceDocument,
} from "@/lib/types";
import { getBDC, ajouterBLauBDC, mettreAJourQuantitesBDC } from "./bdc";

/**
 * Générer un numéro de BL unique
 */
async function genererNumeroBL(): Promise<string> {
  const year = new Date().getFullYear();
  const blRef = collection(db, BL_COLLECTION_NAME);
  const q = query(
    blRef,
    where("numero", ">=", `BL-${year}-`),
    where("numero", "<", `BL-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `BL-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `BL-${year}-${nouveauIncrement}`;
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
 * Récupérer tous les BL
 */
export async function getBLs(): Promise<BonDeLivraison[]> {
  try {
    const blRef = collection(db, BL_COLLECTION_NAME);
    const q = query(blRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const bls: BonDeLivraison[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bls.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        dateLivraisonPrevue: data.dateLivraisonPrevue?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        lieuLivraison: data.lieuLivraison,
        receptionnePar: data.receptionnePar,
        signatureReceptionnaire: data.signatureReceptionnaire,
        typeLivraison: data.typeLivraison,
        estDerniereLivraison: data.estDerniereLivraison || false,
        factures: data.factures || [],
        estFacture: data.estFacture || false,
        montantFacture: data.montantFacture || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bls;
  } catch (error) {
    console.error("Erreur lors de la récupération des BL:", error);
    throw new Error("Impossible de récupérer les BL");
  }
}

/**
 * Récupérer un BL par son ID
 */
export async function getBL(id: string): Promise<BonDeLivraison> {
  try {
    const blDoc = doc(db, BL_COLLECTION_NAME, id);
    const blSnapshot = await getDoc(blDoc);

    if (!blSnapshot.exists()) {
      throw new Error("BL introuvable");
    }

    const data = blSnapshot.data();
    return {
      id: blSnapshot.id,
      numero: data.numero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateLivraison: data.dateLivraison?.toDate() || new Date(),
      dateLivraisonPrevue: data.dateLivraisonPrevue?.toDate(),
      lignes: data.lignes || [],
      totalHT: data.totalHT || 0,
      totalTVA: data.totalTVA || 0,
      totalTTC: data.totalTTC || 0,
      statut: data.statut,
      notes: data.notes,
      lieuLivraison: data.lieuLivraison,
      receptionnePar: data.receptionnePar,
      signatureReceptionnaire: data.signatureReceptionnaire,
      typeLivraison: data.typeLivraison,
      estDerniereLivraison: data.estDerniereLivraison || false,
      factures: data.factures || [],
      estFacture: data.estFacture || false,
      montantFacture: data.montantFacture || 0,
      historique: data.historique || [],
      piecesJointes: data.piecesJointes || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du BL:", error);
    throw new Error("Impossible de récupérer le BL");
  }
}

/**
 * Récupérer les BL d'un BDC
 */
export async function getBLsByBDC(bdcId: string): Promise<BonDeLivraison[]> {
  try {
    const blRef = collection(db, BL_COLLECTION_NAME);
    const q = query(
      blRef,
      where("bdcId", "==", bdcId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bls: BonDeLivraison[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bls.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        dateLivraisonPrevue: data.dateLivraisonPrevue?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        lieuLivraison: data.lieuLivraison,
        receptionnePar: data.receptionnePar,
        signatureReceptionnaire: data.signatureReceptionnaire,
        typeLivraison: data.typeLivraison,
        estDerniereLivraison: data.estDerniereLivraison || false,
        factures: data.factures || [],
        estFacture: data.estFacture || false,
        montantFacture: data.montantFacture || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bls;
  } catch (error) {
    console.error("Erreur lors de la récupération des BL du BDC:", error);
    throw new Error("Impossible de récupérer les BL du BDC");
  }
}

/**
 * Récupérer les BL d'un client
 */
export async function getBLsByClient(clientId: string): Promise<BonDeLivraison[]> {
  try {
    const blRef = collection(db, BL_COLLECTION_NAME);
    const q = query(
      blRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bls: BonDeLivraison[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bls.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        dateLivraisonPrevue: data.dateLivraisonPrevue?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        lieuLivraison: data.lieuLivraison,
        receptionnePar: data.receptionnePar,
        signatureReceptionnaire: data.signatureReceptionnaire,
        typeLivraison: data.typeLivraison,
        estDerniereLivraison: data.estDerniereLivraison || false,
        factures: data.factures || [],
        estFacture: data.estFacture || false,
        montantFacture: data.montantFacture || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bls;
  } catch (error) {
    console.error("Erreur lors de la récupération des BL du client:", error);
    throw new Error("Impossible de récupérer les BL du client");
  }
}

/**
 * Créer un nouveau BL
 */
export async function createBL(
  blData: CreateBLInput,
  userId: string
): Promise<string> {
  try {
    // Récupérer les infos du BDC
    const bdc = await getBDC(blData.bdcId);

    // Générer le numéro de BL
    const numero = await genererNumeroBL();

    // Calculer les lignes avec montants
    const lignes = blData.lignes.map(calculerMontantsLigne);

    // Calculer les totaux
    const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);

    // Calculer la quantité livrée
    const quantiteLivree = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);

    // Déterminer si c'est la dernière livraison
    const nouvellequantiteLivreeTotal = bdc.quantiteLivree + quantiteLivree;
    const estDerniereLivraison =
      nouvellequantiteLivreeTotal >= bdc.quantiteCommandee;

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création du BL"),
      creerActionHistorique(
        "livraison",
        userId,
        `Livraison de ${quantiteLivree} articles pour le BDC ${bdc.numero}`
      ),
    ];

    const blRef = collection(db, BL_COLLECTION_NAME);
    const docRef = await addDoc(blRef, {
      numero,
      clientId: bdc.clientId,
      clientNom: bdc.clientNom,
      bdcId: blData.bdcId,
      bdcNumero: bdc.numero,
      dateCreation: serverTimestamp(),
      dateLivraison: Timestamp.fromDate(blData.dateLivraison),
      dateLivraisonPrevue: blData.dateLivraisonPrevue
        ? Timestamp.fromDate(blData.dateLivraisonPrevue)
        : null,
      lignes,
      totalHT,
      totalTVA,
      totalTTC,
      statut: "livre" as StatutBL,
      notes: blData.notes,
      lieuLivraison: blData.lieuLivraison,
      receptionnePar: blData.receptionnePar,
      typeLivraison: blData.typeLivraison,
      estDerniereLivraison,
      factures: [],
      estFacture: false,
      montantFacture: 0,
      historique,
      piecesJointes: [],
      creePar: userId,
    });

    // Mettre à jour les quantités du BDC
    await mettreAJourQuantitesBDC(blData.bdcId, quantiteLivree, undefined, userId);

    // Ajouter la référence du BL au BDC
    const blRef_: ReferenceDocument = {
      id: docRef.id,
      numero,
      type: "bl",
      date: blData.dateLivraison,
    };
    await ajouterBLauBDC(blData.bdcId, blRef_, userId);

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du BL:", error);
    throw new Error("Impossible de créer le BL");
  }
}

/**
 * Mettre à jour un BL
 */
export async function updateBL(
  blData: UpdateBLInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = blData;
    const blDoc = doc(db, BL_COLLECTION_NAME, id);

    // Vérifier que le BL n'est pas déjà facturé
    const blSnapshot = await getDoc(blDoc);
    if (!blSnapshot.exists()) {
      throw new Error("BL introuvable");
    }

    if (blSnapshot.data().estFacture) {
      throw new Error(
        "Impossible de modifier un BL déjà facturé"
      );
    }

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
    if (updateData.dateLivraison)
      dataToUpdate.dateLivraison = Timestamp.fromDate(updateData.dateLivraison);
    if (updateData.dateLivraisonPrevue)
      dataToUpdate.dateLivraisonPrevue = Timestamp.fromDate(
        updateData.dateLivraisonPrevue
      );
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.lieuLivraison !== undefined)
      dataToUpdate.lieuLivraison = updateData.lieuLivraison;
    if (updateData.receptionnePar !== undefined)
      dataToUpdate.receptionnePar = updateData.receptionnePar;
    if (updateData.typeLivraison !== undefined)
      dataToUpdate.typeLivraison = updateData.typeLivraison;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const currentHistorique = blSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "modification",
      userId,
      "Modification du BL"
    );
    dataToUpdate.historique = [...currentHistorique, nouvelleAction];

    await updateDoc(blDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du BL:", error);
    throw new Error("Impossible de mettre à jour le BL");
  }
}

/**
 * Changer le statut d'un BL
 */
export async function changerStatutBL(
  id: string,
  statut: StatutBL,
  userId: string
): Promise<void> {
  try {
    const blDoc = doc(db, BL_COLLECTION_NAME, id);
    const blSnapshot = await getDoc(blDoc);

    if (!blSnapshot.exists()) {
      throw new Error("BL introuvable");
    }

    const currentHistorique = blSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "changement_statut",
      userId,
      `Statut changé en: ${statut}`
    );

    await updateDoc(blDoc, {
      statut,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du BL");
  }
}

/**
 * Supprimer un BL
 */
export async function deleteBL(id: string): Promise<void> {
  try {
    // Vérifier que le BL n'est pas facturé
    const bl = await getBL(id);
    if (bl.estFacture) {
      throw new Error("Impossible de supprimer un BL déjà facturé");
    }

    const blDoc = doc(db, BL_COLLECTION_NAME, id);
    await deleteDoc(blDoc);

    // TODO: Mettre à jour les quantités du BDC (soustraire les quantités du BL)
  } catch (error) {
    console.error("Erreur lors de la suppression du BL:", error);
    throw new Error("Impossible de supprimer le BL");
  }
}

/**
 * Marquer un BL comme facturé
 * Cette fonction est appelée lors de la création d'une facture
 */
export async function marquerBLFacture(
  blId: string,
  factureRef: ReferenceDocument,
  montantFacture: number,
  userId: string
): Promise<void> {
  try {
    const blDoc = doc(db, BL_COLLECTION_NAME, blId);
    const blSnapshot = await getDoc(blDoc);

    if (!blSnapshot.exists()) {
      throw new Error("BL introuvable");
    }

    const currentFactures = blSnapshot.data().factures || [];
    const currentHistorique = blSnapshot.data().historique || [];
    const currentMontantFacture = blSnapshot.data().montantFacture || 0;

    const nouvelleAction = creerActionHistorique(
      "facturation",
      userId,
      `Facture ${factureRef.numero} créée pour ce BL`
    );

    await updateDoc(blDoc, {
      factures: [...currentFactures, factureRef],
      estFacture: true,
      montantFacture: currentMontantFacture + montantFacture,
      statut: "facture",
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors de la facturation du BL:", error);
    throw new Error("Impossible de marquer le BL comme facturé");
  }
}

/**
 * Récupérer les BL non facturés d'un BDC
 */
export async function getBLsNonFactures(bdcId: string): Promise<BonDeLivraison[]> {
  try {
    const blRef = collection(db, BL_COLLECTION_NAME);
    const q = query(
      blRef,
      where("bdcId", "==", bdcId),
      where("estFacture", "==", false),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bls: BonDeLivraison[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bls.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        dateLivraisonPrevue: data.dateLivraisonPrevue?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        lieuLivraison: data.lieuLivraison,
        receptionnePar: data.receptionnePar,
        signatureReceptionnaire: data.signatureReceptionnaire,
        typeLivraison: data.typeLivraison,
        estDerniereLivraison: data.estDerniereLivraison || false,
        factures: data.factures || [],
        estFacture: data.estFacture || false,
        montantFacture: data.montantFacture || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return bls;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des BL non facturés:",
      error
    );
    throw new Error("Impossible de récupérer les BL non facturés");
  }
}
