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
  PROFORMAS_COLLECTION_NAME,
  COUNTERS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import {
  Proforma,
  CreateProformaInput,
  UpdateProformaInput,
  ProformaStatut,
  UpdateProformaStatutInput,
  ProformaLigne,
} from "@/lib/types/proforma";

/**
 * Génère le prochain numéro de proforma
 * Format: "001/RAD/2025"
 */
async function getNextProformaNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `PROFORMA-${year}`;

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
    return `${numeroFormatted}/RAD/${year}`;
  });
}

/**
 * Calcule le prixTotal d'une ligne et assigne le numéro
 */
function processLignes(
  lignes: Omit<ProformaLigne, "numero" | "prixTotal">[]
): ProformaLigne[] {
  return lignes.map((ligne, index) => ({
    ...ligne,
    numero: index + 1,
    prixTotal: ligne.quantite * ligne.prixUnitaire,
  }));
}

/**
 * Calcule les totaux du proforma
 */
function calculateTotals(
  lignes: ProformaLigne[],
  remisePourcentage: number
): { total: number; remiseMontant: number; totalNet: number } {
  const total = lignes.reduce((sum, ligne) => sum + ligne.prixTotal, 0);
  const remiseMontant = (total * remisePourcentage) / 100;
  const totalNet = total - remiseMontant;

  return { total, remiseMontant, totalNet };
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
        numeroDA: data.numeroDA,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateLivraison: data.dateLivraison,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        dateValidation: data.dateValidation?.toDate(),
        statut: data.statut || "BROUILLON",
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
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
      numeroDA: data.numeroDA,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateLivraison: data.dateLivraison,
      lignes: data.lignes || [],
      total: data.total || 0,
      remisePourcentage: data.remisePourcentage || 0,
      remiseMontant: data.remiseMontant || 0,
      totalNet: data.totalNet || 0,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateModification: data.dateModification?.toDate(),
      dateEnvoi: data.dateEnvoi?.toDate(),
      dateValidation: data.dateValidation?.toDate(),
      statut: data.statut || "BROUILLON",
      lieu: data.lieu || "Siguiri",
      fournisseur: data.fournisseur || "Mr Balla TRAORE",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du proforma:", error);
    throw new Error("Impossible de récupérer le proforma");
  }
}

/**
 * Récupérer les proformas d'un client spécifique
 */
export async function getProformasByClient(
  clientId: string
): Promise<Proforma[]> {
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
        numeroDA: data.numeroDA,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateLivraison: data.dateLivraison,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        dateValidation: data.dateValidation?.toDate(),
        statut: data.statut || "BROUILLON",
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return proformas;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des proformas du client:",
      error
    );
    throw new Error("Impossible de récupérer les proformas du client");
  }
}

/**
 * Créer un nouveau proforma
 */
export async function createProforma(
  proformaData: CreateProformaInput
): Promise<string> {
  try {
    // Traiter les lignes (numérotation et calcul prixTotal)
    const lignesProcessed = processLignes(proformaData.lignes);

    // Calculer les totaux
    const remisePourcentage = proformaData.remisePourcentage || 0;
    const { total, remiseMontant, totalNet } = calculateTotals(
      lignesProcessed,
      remisePourcentage
    );

    // Générer le numéro de proforma
    const numero = await getNextProformaNumber();

    const proformasRef = collection(db, PROFORMAS_COLLECTION_NAME);
    const docRef = await addDoc(proformasRef, {
      numero,
      numeroDA: proformaData.numeroDA,
      clientId: proformaData.clientId,
      clientNom: proformaData.clientNom,
      dateLivraison: proformaData.dateLivraison,
      lignes: lignesProcessed,
      total,
      remisePourcentage,
      remiseMontant,
      totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      lieu: proformaData.lieu || "Siguiri",
      fournisseur: proformaData.fournisseur || "Mr Balla TRAORE",
    });

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du proforma:", error);
    throw new Error("Impossible de créer le proforma");
  }
}

/**
 * Mettre à jour un proforma (seulement si statut BROUILLON)
 */
export async function updateProforma(
  proformaData: UpdateProformaInput
): Promise<void> {
  try {
    const { id, ...updateData } = proformaData;
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);

    // Vérifier que le proforma est en mode BROUILLON
    const currentProforma = await getDoc(proformaDoc);
    if (!currentProforma.exists()) {
      throw new Error("Proforma introuvable");
    }

    if (currentProforma.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de modifier un proforma qui n'est pas en mode BROUILLON"
      );
    }

    // Préparer les données de mise à jour
    const updatePayload: Record<string, unknown> = {
      dateModification: serverTimestamp(),
    };

    if (updateData.numeroDA) updatePayload.numeroDA = updateData.numeroDA;
    if (updateData.clientId) updatePayload.clientId = updateData.clientId;
    if (updateData.clientNom) updatePayload.clientNom = updateData.clientNom;
    if (updateData.dateLivraison)
      updatePayload.dateLivraison = updateData.dateLivraison;
    if (updateData.lieu) updatePayload.lieu = updateData.lieu;
    if (updateData.fournisseur)
      updatePayload.fournisseur = updateData.fournisseur;

    // Si les lignes sont modifiées, recalculer tout
    if (updateData.lignes) {
      const lignesProcessed = processLignes(updateData.lignes);
      const remisePourcentage =
        updateData.remisePourcentage !== undefined
          ? updateData.remisePourcentage
          : currentProforma.data().remisePourcentage || 0;

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
      const lignes = currentProforma.data().lignes || [];
      const { total, remiseMontant, totalNet } = calculateTotals(
        lignes,
        updateData.remisePourcentage
      );

      updatePayload.remisePourcentage = updateData.remisePourcentage;
      updatePayload.remiseMontant = remiseMontant;
      updatePayload.totalNet = totalNet;
    }

    await updateDoc(proformaDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du proforma:", error);
    throw error;
  }
}

/**
 * Changer le statut d'un proforma
 */
export async function updateProformaStatut(
  data: UpdateProformaStatutInput
): Promise<void> {
  try {
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, data.id);

    const updatePayload: Record<string, unknown> = {
      statut: data.statut,
      dateModification: serverTimestamp(),
    };

    if (data.statut === "ENVOYE" && data.dateEnvoi) {
      updatePayload.dateEnvoi = Timestamp.fromDate(data.dateEnvoi);
    }

    if (data.statut === "VALIDE" && data.dateValidation) {
      updatePayload.dateValidation = Timestamp.fromDate(data.dateValidation);
    }

    await updateDoc(proformaDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du proforma");
  }
}

/**
 * Supprimer un proforma (seulement si statut BROUILLON)
 */
export async function deleteProforma(id: string): Promise<void> {
  try {
    const proformaDoc = doc(db, PROFORMAS_COLLECTION_NAME, id);

    // Vérifier que le proforma est en mode BROUILLON
    const currentProforma = await getDoc(proformaDoc);
    if (!currentProforma.exists()) {
      throw new Error("Proforma introuvable");
    }

    if (currentProforma.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de supprimer un proforma qui n'est pas en mode BROUILLON"
      );
    }

    await deleteDoc(proformaDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du proforma:", error);
    throw error;
  }
}
