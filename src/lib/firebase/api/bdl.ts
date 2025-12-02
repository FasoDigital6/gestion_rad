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
  Timestamp,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import {
  BDL_COLLECTION_NAME,
  BDC_COLLECTION_NAME,
  COUNTERS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import {
  Bdl,
  CreateBdlInput,
  UpdateBdlInput,
  UpdateBdlStatutInput,
  BdlLigne,
  BdcDeliveryProgress,
  BdcLigneProgress,
} from "@/lib/types/bdl";
import { getBdc } from "./bdc";
import { Bdc } from "@/lib/types/bdc";

/**
 * Génère le prochain numéro de BDL
 * Format: "001/BDL/2025"
 */
async function getNextBdlNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `BDL-${year}`;

  return await runTransaction(db, async (transaction) => {
    const counterRef = doc(db, COUNTERS_COLLECTION_NAME, counterId);
    const counterDoc = await transaction.get(counterRef);

    let nextNumber = 1;
    if (counterDoc.exists()) {
      nextNumber = (counterDoc.data().lastNumber || 0) + 1;
      transaction.update(counterRef, { lastNumber: nextNumber });
    } else {
      transaction.set(counterRef, { lastNumber: nextNumber });
    }

    // Format: 001, 002, ..., 099, 100
    const numeroFormatted = nextNumber.toString().padStart(3, "0");
    return `${numeroFormatted}/BDL/${year}`;
  });
}

/**
 * Calcule le prixTotal d'une ligne et assigne le numéro
 */
function processLignes(
  lignes: Omit<BdlLigne, "numero" | "prixTotal">[]
): BdlLigne[] {
  return lignes.map((ligne, index) => ({
    ...ligne,
    numero: index + 1,
    prixTotal: ligne.quantiteLivree * ligne.prixUnitaire,
  }));
}

/**
 * Calcule les totaux du BDL
 */
function calculateTotals(
  lignes: BdlLigne[],
  remisePourcentage: number
): { total: number; remiseMontant: number; totalNet: number } {
  const total = lignes.reduce((sum, ligne) => sum + ligne.prixTotal, 0);
  const remiseMontant = (total * remisePourcentage) / 100;
  const totalNet = total - remiseMontant;

  return { total, remiseMontant, totalNet };
}

/**
 * Récupérer tous les BDLs
 */
export async function getBdls(): Promise<Bdl[]> {
  try {
    const bdlsRef = collection(db, BDL_COLLECTION_NAME);
    const q = query(bdlsRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const bdls: Bdl[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdls.push({
        id: doc.id,
        numero: data.numero,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        heureLivraison: data.heureLivraison,
        nomLivreur: data.nomLivreur,
        observations: data.observations,
        signatureReception: data.signatureReception,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnRoute: data.dateEnRoute?.toDate(),
        dateLivree: data.dateLivree?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdls;
  } catch (error) {
    console.error("Erreur lors de la récupération des BDLs:", error);
    throw new Error("Impossible de récupérer les BDLs");
  }
}

/**
 * Récupérer un BDL par son ID
 */
export async function getBdl(id: string): Promise<Bdl> {
  try {
    const bdlDoc = doc(db, BDL_COLLECTION_NAME, id);
    const bdlSnapshot = await getDoc(bdlDoc);

    if (!bdlSnapshot.exists()) {
      throw new Error("BDL introuvable");
    }

    const data = bdlSnapshot.data();
    return {
      id: bdlSnapshot.id,
      numero: data.numero,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateLivraison: data.dateLivraison?.toDate() || new Date(),
      heureLivraison: data.heureLivraison,
      nomLivreur: data.nomLivreur,
      observations: data.observations,
      signatureReception: data.signatureReception,
      lignes: data.lignes || [],
      total: data.total || 0,
      remisePourcentage: data.remisePourcentage || 0,
      remiseMontant: data.remiseMontant || 0,
      totalNet: data.totalNet || 0,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateModification: data.dateModification?.toDate(),
      dateEnRoute: data.dateEnRoute?.toDate(),
      dateLivree: data.dateLivree?.toDate(),
      dateAnnulation: data.dateAnnulation?.toDate(),
      statut: data.statut || "BROUILLON",
      notes: data.notes,
      lieu: data.lieu || "Siguiri",
      fournisseur: data.fournisseur || "Mr Balla TRAORE",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du BDL:", error);
    throw new Error("Impossible de récupérer le BDL");
  }
}

/**
 * Récupérer les BDLs créés depuis un BDC spécifique
 * CRITIQUE : Utilisé pour calculer les quantités restantes
 */
export async function getBdlsByBdc(bdcId: string): Promise<Bdl[]> {
  try {
    const bdlsRef = collection(db, BDL_COLLECTION_NAME);
    const q = query(
      bdlsRef,
      where("bdcId", "==", bdcId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bdls: Bdl[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdls.push({
        id: doc.id,
        numero: data.numero,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        heureLivraison: data.heureLivraison,
        nomLivreur: data.nomLivreur,
        observations: data.observations,
        signatureReception: data.signatureReception,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnRoute: data.dateEnRoute?.toDate(),
        dateLivree: data.dateLivree?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdls;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des BDLs du BDC:",
      error
    );
    throw new Error("Impossible de récupérer les BDLs du BDC");
  }
}

/**
 * Récupérer les BDLs d'un client spécifique
 */
export async function getBdlsByClient(clientId: string): Promise<Bdl[]> {
  try {
    const bdlsRef = collection(db, BDL_COLLECTION_NAME);
    const q = query(
      bdlsRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bdls: Bdl[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdls.push({
        id: doc.id,
        numero: data.numero,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateLivraison: data.dateLivraison?.toDate() || new Date(),
        heureLivraison: data.heureLivraison,
        nomLivreur: data.nomLivreur,
        observations: data.observations,
        signatureReception: data.signatureReception,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnRoute: data.dateEnRoute?.toDate(),
        dateLivree: data.dateLivree?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        factureId: data.factureId,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdls;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des BDLs du client:",
      error
    );
    throw new Error("Impossible de récupérer les BDLs du client");
  }
}

/**
 * FONCTION CRITIQUE : Calculer la progression de livraison d'un BDC
 * Retourne les quantités restantes pour chaque ligne
 */
export async function getBdcDeliveryProgress(
  bdcId: string
): Promise<BdcDeliveryProgress> {
  try {
    // 1. Récupérer le BDC
    const bdc = await getBdc(bdcId);

    // 2. Récupérer tous les BDLs pour ce BDC (excluant les annulés)
    const bdls = await getBdlsByBdc(bdcId);
    const activeBdls = bdls.filter((bdl) => bdl.statut !== "ANNULE");

    // 3. Calculer la progression par ligne
    const lignesProgress: BdcLigneProgress[] = bdc.lignes.map((bdcLigne) => {
      // Sommer les quantités livrées de tous les BDL pour cette ligne
      const quantiteTotaleLivree = activeBdls.reduce((sum, bdl) => {
        const bdlLigne = bdl.lignes.find((l) => l.numero === bdcLigne.numero);
        return sum + (bdlLigne?.quantiteLivree || 0);
      }, 0);

      const quantiteRestante = bdcLigne.quantite - quantiteTotaleLivree;
      const pourcentageLivre =
        (quantiteTotaleLivree / bdcLigne.quantite) * 100;

      return {
        ligneNumero: bdcLigne.numero,
        designation: bdcLigne.designation,
        unite: bdcLigne.unite,
        quantiteCommandee: bdcLigne.quantite,
        quantiteTotaleLivree,
        quantiteRestante,
        pourcentageLivre,
      };
    });

    // 4. Calculer la progression globale
    const pourcentageGlobalLivre =
      lignesProgress.reduce((sum, lp) => sum + lp.pourcentageLivre, 0) /
      lignesProgress.length;

    const estCompletementLivre = lignesProgress.every(
      (lp) => lp.quantiteRestante === 0
    );

    return {
      bdcId: bdc.id,
      bdcNumero: bdc.numero,
      lignesProgress,
      pourcentageGlobalLivre,
      estCompletementLivre,
    };
  } catch (error) {
    console.error(
      "Erreur lors du calcul de la progression de livraison:",
      error
    );
    throw error;
  }
}

/**
 * Créer un nouveau BDL (version générique)
 */
export async function createBdl(bdlData: CreateBdlInput): Promise<string> {
  try {
    // Traiter les lignes (numérotation et calcul prixTotal)
    const lignesProcessed = processLignes(bdlData.lignes);

    // Calculer les totaux
    const remisePourcentage = bdlData.remisePourcentage || 0;
    const { total, remiseMontant, totalNet } = calculateTotals(
      lignesProcessed,
      remisePourcentage
    );

    // Générer le numéro de BDL
    const numero = await getNextBdlNumber();

    // Construire le payload en évitant les valeurs undefined
    const payload: Record<string, unknown> = {
      numero,
      bdcId: bdlData.bdcId,
      bdcNumero: bdlData.bdcNumero,
      clientId: bdlData.clientId,
      clientNom: bdlData.clientNom,
      dateLivraison: Timestamp.fromDate(bdlData.dateLivraison),
      lignes: lignesProcessed,
      total,
      remisePourcentage,
      remiseMontant,
      totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      lieu: bdlData.lieu || "Siguiri",
      fournisseur: bdlData.fournisseur || "Mr Balla TRAORE",
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (bdlData.heureLivraison) {
      payload.heureLivraison = bdlData.heureLivraison;
    }
    if (bdlData.nomLivreur) {
      payload.nomLivreur = bdlData.nomLivreur;
    }
    if (bdlData.observations) {
      payload.observations = bdlData.observations;
    }
    if (bdlData.signatureReception) {
      payload.signatureReception = bdlData.signatureReception;
    }
    if (bdlData.notes) {
      payload.notes = bdlData.notes;
    }

    const bdlsRef = collection(db, BDL_COLLECTION_NAME);
    const docRef = await addDoc(bdlsRef, payload);

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du BDL:", error);
    throw new Error("Impossible de créer le BDL");
  }
}

/**
 * FONCTION CRITIQUE : Créer un BDL depuis un BDC avec validation des quantités
 * Support des livraisons partielles
 */
export async function createBdlFromBdc(
  bdcId: string,
  deliveryData: {
    dateLivraison: Date;
    heureLivraison?: string;
    nomLivreur?: string;
    observations?: string;
    signatureReception?: string;
    lignes: Array<{ ligneNumero: number; quantiteLivree: number }>;
    notes?: string;
  }
): Promise<string> {
  return await runTransaction(db, async (transaction) => {
    // 1. Récupérer le BDC dans la transaction
    const bdcRef = doc(db, BDC_COLLECTION_NAME, bdcId);
    const bdcSnap = await transaction.get(bdcRef);

    if (!bdcSnap.exists()) {
      throw new Error("BDC introuvable");
    }

    const bdc = { id: bdcSnap.id, ...bdcSnap.data() } as Bdc;

    // 2. Vérifier que le BDC est approuvé
    if (bdc.statut !== "APPROUVE") {
      throw new Error("Seuls les BDCs approuvés peuvent générer un BDL");
    }

    // 3. Récupérer tous les BDLs existants pour ce BDC (dans la transaction)
    const bdlsQuery = query(
      collection(db, BDL_COLLECTION_NAME),
      where("bdcId", "==", bdcId)
    );
    const bdlsSnap = await getDocs(bdlsQuery);
    const existingBdls: Bdl[] = [];
    bdlsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.statut !== "ANNULE") {
        existingBdls.push({
          id: doc.id,
          ...data,
          dateLivraison: data.dateLivraison?.toDate() || new Date(),
          dateCreation: data.dateCreation?.toDate() || new Date(),
          dateModification: data.dateModification?.toDate(),
          dateEnRoute: data.dateEnRoute?.toDate(),
          dateLivree: data.dateLivree?.toDate(),
          dateAnnulation: data.dateAnnulation?.toDate(),
        } as Bdl);
      }
    });

    // 4. VALIDATION : Vérifier les quantités pour chaque ligne
    for (const deliveryLigne of deliveryData.lignes) {
      const bdcLigne = bdc.lignes.find(
        (l) => l.numero === deliveryLigne.ligneNumero
      );

      if (!bdcLigne) {
        throw new Error(
          `Ligne ${deliveryLigne.ligneNumero} introuvable dans le BDC`
        );
      }

      // Calculer la quantité déjà livrée
      const quantiteTotaleLivree = existingBdls.reduce((sum, bdl) => {
        const bdlLigne = bdl.lignes.find(
          (l) => l.numero === deliveryLigne.ligneNumero
        );
        return sum + (bdlLigne?.quantiteLivree || 0);
      }, 0);

      const quantiteRestante = bdcLigne.quantite - quantiteTotaleLivree;

      // Validation 1 : Pas de dépassement
      if (deliveryLigne.quantiteLivree > quantiteRestante) {
        throw new Error(
          `Quantité livrée (${deliveryLigne.quantiteLivree}) dépasse la quantité restante (${quantiteRestante}) pour ${bdcLigne.designation}`
        );
      }

      // Validation 2 : Quantité > 0
      if (deliveryLigne.quantiteLivree <= 0) {
        throw new Error(
          `Quantité livrée doit être supérieure à 0 pour ${bdcLigne.designation}`
        );
      }
    }

    // 5. Construire les lignes du BDL
    const bdlLignes: BdlLigne[] = deliveryData.lignes.map((dl, index) => {
      const bdcLigne = bdc.lignes.find((l) => l.numero === dl.ligneNumero)!;
      return {
        numero: index + 1,
        designation: bdcLigne.designation,
        unite: bdcLigne.unite,
        quantiteCommandee: bdcLigne.quantite,
        quantiteLivree: dl.quantiteLivree,
        prixUnitaire: bdcLigne.prixUnitaire,
        prixTotal: dl.quantiteLivree * bdcLigne.prixUnitaire,
      };
    });

    // 6. Calculer les totaux
    const { total, remiseMontant, totalNet } = calculateTotals(
      bdlLignes,
      bdc.remisePourcentage
    );

    // 7. Générer le numéro
    const numero = await getNextBdlNumber();

    // 8. Créer le BDL
    const bdlRef = doc(collection(db, BDL_COLLECTION_NAME));
    const payload: Record<string, unknown> = {
      numero,
      bdcId: bdc.id,
      bdcNumero: bdc.numero,
      clientId: bdc.clientId,
      clientNom: bdc.clientNom,
      dateLivraison: Timestamp.fromDate(deliveryData.dateLivraison),
      lignes: bdlLignes,
      total,
      remisePourcentage: bdc.remisePourcentage,
      remiseMontant,
      totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      lieu: bdc.lieu,
      fournisseur: bdc.fournisseur,
    };

    // Ajouter les champs optionnels
    if (deliveryData.heureLivraison) {
      payload.heureLivraison = deliveryData.heureLivraison;
    }
    if (deliveryData.nomLivreur) {
      payload.nomLivreur = deliveryData.nomLivreur;
    }
    if (deliveryData.observations) {
      payload.observations = deliveryData.observations;
    }
    if (deliveryData.signatureReception) {
      payload.signatureReception = deliveryData.signatureReception;
    }
    if (deliveryData.notes) {
      payload.notes = deliveryData.notes;
    }

    transaction.set(bdlRef, payload);

    return bdlRef.id;
  });
}

/**
 * Mettre à jour un BDL (seulement si statut BROUILLON)
 */
export async function updateBdl(bdlData: UpdateBdlInput): Promise<void> {
  try {
    const { id, ...updateData } = bdlData;
    const bdlDoc = doc(db, BDL_COLLECTION_NAME, id);

    // Vérifier que le BDL est en mode BROUILLON
    const currentBdl = await getDoc(bdlDoc);
    if (!currentBdl.exists()) {
      throw new Error("BDL introuvable");
    }

    if (currentBdl.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de modifier un BDL qui n'est pas en mode BROUILLON"
      );
    }

    // Préparer les données de mise à jour
    const updatePayload: Record<string, unknown> = {
      dateModification: serverTimestamp(),
    };

    if (updateData.clientId) updatePayload.clientId = updateData.clientId;
    if (updateData.clientNom) updatePayload.clientNom = updateData.clientNom;
    if (updateData.dateLivraison)
      updatePayload.dateLivraison = Timestamp.fromDate(
        updateData.dateLivraison
      );
    if (updateData.heureLivraison)
      updatePayload.heureLivraison = updateData.heureLivraison;
    if (updateData.nomLivreur) updatePayload.nomLivreur = updateData.nomLivreur;
    if (updateData.observations)
      updatePayload.observations = updateData.observations;
    if (updateData.signatureReception)
      updatePayload.signatureReception = updateData.signatureReception;
    if (updateData.notes) updatePayload.notes = updateData.notes;
    if (updateData.lieu) updatePayload.lieu = updateData.lieu;
    if (updateData.fournisseur)
      updatePayload.fournisseur = updateData.fournisseur;

    // Si les lignes sont modifiées, recalculer tout
    if (updateData.lignes) {
      const lignesProcessed = processLignes(updateData.lignes);
      const remisePourcentage =
        updateData.remisePourcentage !== undefined
          ? updateData.remisePourcentage
          : currentBdl.data().remisePourcentage || 0;

      const { total, remiseMontant, totalNet } = calculateTotals(
        lignesProcessed,
        remisePourcentage
      );

      updatePayload.lignes = lignesProcessed;
      updatePayload.total = total;
      updatePayload.remisePourcentage = remisePourcentage;
      updatePayload.remiseMontant = remiseMontant;
      updatePayload.totalNet = totalNet;
    } else if (updateData.remisePourcentage !== undefined) {
      // Si seulement la remise change, recalculer les totaux
      const lignes = currentBdl.data().lignes || [];
      const { total, remiseMontant, totalNet } = calculateTotals(
        lignes,
        updateData.remisePourcentage
      );

      updatePayload.remisePourcentage = updateData.remisePourcentage;
      updatePayload.remiseMontant = remiseMontant;
      updatePayload.totalNet = totalNet;
    }

    await updateDoc(bdlDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du BDL:", error);
    throw error;
  }
}

/**
 * Changer le statut d'un BDL
 */
export async function updateBdlStatut(
  data: UpdateBdlStatutInput
): Promise<void> {
  try {
    const bdlDoc = doc(db, BDL_COLLECTION_NAME, data.id);

    const updatePayload: Record<string, unknown> = {
      statut: data.statut,
      dateModification: serverTimestamp(),
    };

    if (data.statut === "EN_ROUTE" && data.dateEnRoute) {
      updatePayload.dateEnRoute = Timestamp.fromDate(data.dateEnRoute);
    }

    if (data.statut === "LIVRE" && data.dateLivree) {
      updatePayload.dateLivree = Timestamp.fromDate(data.dateLivree);
    }

    if (data.statut === "ANNULE" && data.dateAnnulation) {
      updatePayload.dateAnnulation = Timestamp.fromDate(data.dateAnnulation);
    }

    await updateDoc(bdlDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du BDL");
  }
}

/**
 * Supprimer un BDL (seulement si statut BROUILLON)
 */
export async function deleteBdl(id: string): Promise<void> {
  try {
    const bdlDoc = doc(db, BDL_COLLECTION_NAME, id);

    // Vérifier que le BDL est en mode BROUILLON
    const currentBdl = await getDoc(bdlDoc);
    if (!currentBdl.exists()) {
      throw new Error("BDL introuvable");
    }

    if (currentBdl.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de supprimer un BDL qui n'est pas en mode BROUILLON"
      );
    }

    await deleteDoc(bdlDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du BDL:", error);
    throw error;
  }
}
