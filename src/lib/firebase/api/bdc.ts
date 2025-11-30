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
  BDC_COLLECTION_NAME,
  COUNTERS_COLLECTION_NAME,
  PROFORMAS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import {
  Bdc,
  CreateBdcInput,
  UpdateBdcInput,
  BdcStatut,
  UpdateBdcStatutInput,
  BdcLigne,
} from "@/lib/types/bdc";
import { getProforma } from "./proformas";

/**
 * Génère le prochain numéro de BDC
 * Format: "001/BDC/2025"
 */
async function getNextBdcNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `BDC-${year}`;

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
    return `${numeroFormatted}/BDC/${year}`;
  });
}

/**
 * Calcule le prixTotal d'une ligne et assigne le numéro
 */
function processLignes(
  lignes: Omit<BdcLigne, "numero" | "prixTotal">[]
): BdcLigne[] {
  return lignes.map((ligne, index) => ({
    ...ligne,
    numero: index + 1,
    prixTotal: ligne.quantite * ligne.prixUnitaire,
  }));
}

/**
 * Calcule les totaux du BDC
 */
function calculateTotals(
  lignes: BdcLigne[],
  remisePourcentage: number
): { total: number; remiseMontant: number; totalNet: number } {
  const total = lignes.reduce((sum, ligne) => sum + ligne.prixTotal, 0);
  const remiseMontant = (total * remisePourcentage) / 100;
  const totalNet = total - remiseMontant;

  return { total, remiseMontant, totalNet };
}

/**
 * Récupérer tous les BDCs
 */
export async function getBdcs(): Promise<Bdc[]> {
  try {
    const bdcsRef = collection(db, BDC_COLLECTION_NAME);
    const q = query(bdcsRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const bdcs: Bdc[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdcs.push({
        id: doc.id,
        numero: data.numero,
        proformaId: data.proformaId,
        proformaNumero: data.proformaNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCommande: data.dateCommande?.toDate() || new Date(),
        dateLivraisonSouhaitee: data.dateLivraisonSouhaitee,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        dateApprobation: data.dateApprobation?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        conditionsPaiement: data.conditionsPaiement,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdcs;
  } catch (error) {
    console.error("Erreur lors de la récupération des BDCs:", error);
    throw new Error("Impossible de récupérer les BDCs");
  }
}

/**
 * Récupérer un BDC par son ID
 */
export async function getBdc(id: string): Promise<Bdc> {
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
      proformaId: data.proformaId,
      proformaNumero: data.proformaNumero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      dateCommande: data.dateCommande?.toDate() || new Date(),
      dateLivraisonSouhaitee: data.dateLivraisonSouhaitee,
      lignes: data.lignes || [],
      total: data.total || 0,
      remisePourcentage: data.remisePourcentage || 0,
      remiseMontant: data.remiseMontant || 0,
      totalNet: data.totalNet || 0,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateModification: data.dateModification?.toDate(),
      dateEnvoi: data.dateEnvoi?.toDate(),
      dateApprobation: data.dateApprobation?.toDate(),
      dateAnnulation: data.dateAnnulation?.toDate(),
      statut: data.statut || "BROUILLON",
      notes: data.notes,
      conditionsPaiement: data.conditionsPaiement,
      lieu: data.lieu || "Siguiri",
      fournisseur: data.fournisseur || "Mr Balla TRAORE",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du BDC:", error);
    throw new Error("Impossible de récupérer le BDC");
  }
}

/**
 * Récupérer les BDCs d'un client spécifique
 */
export async function getBdcsByClient(clientId: string): Promise<Bdc[]> {
  try {
    const bdcsRef = collection(db, BDC_COLLECTION_NAME);
    const q = query(
      bdcsRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bdcs: Bdc[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdcs.push({
        id: doc.id,
        numero: data.numero,
        proformaId: data.proformaId,
        proformaNumero: data.proformaNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCommande: data.dateCommande?.toDate() || new Date(),
        dateLivraisonSouhaitee: data.dateLivraisonSouhaitee,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        dateApprobation: data.dateApprobation?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        conditionsPaiement: data.conditionsPaiement,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdcs;
  } catch (error) {
    console.error("Erreur lors de la récupération des BDCs du client:", error);
    throw new Error("Impossible de récupérer les BDCs du client");
  }
}

/**
 * Récupérer les BDCs créés depuis un proforma spécifique
 */
export async function getBdcsByProforma(proformaId: string): Promise<Bdc[]> {
  try {
    const bdcsRef = collection(db, BDC_COLLECTION_NAME);
    const q = query(
      bdcsRef,
      where("proformaId", "==", proformaId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const bdcs: Bdc[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bdcs.push({
        id: doc.id,
        numero: data.numero,
        proformaId: data.proformaId,
        proformaNumero: data.proformaNumero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        dateCommande: data.dateCommande?.toDate() || new Date(),
        dateLivraisonSouhaitee: data.dateLivraisonSouhaitee,
        lignes: data.lignes || [],
        total: data.total || 0,
        remisePourcentage: data.remisePourcentage || 0,
        remiseMontant: data.remiseMontant || 0,
        totalNet: data.totalNet || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        dateApprobation: data.dateApprobation?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
        statut: data.statut || "BROUILLON",
        notes: data.notes,
        conditionsPaiement: data.conditionsPaiement,
        lieu: data.lieu || "Siguiri",
        fournisseur: data.fournisseur || "Mr Balla TRAORE",
      });
    });

    return bdcs;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des BDCs du proforma:",
      error
    );
    throw new Error("Impossible de récupérer les BDCs du proforma");
  }
}

/**
 * Créer un nouveau BDC
 */
export async function createBdc(bdcData: CreateBdcInput): Promise<string> {
  try {
    // Traiter les lignes (numérotation et calcul prixTotal)
    const lignesProcessed = processLignes(bdcData.lignes);

    // Calculer les totaux
    const remisePourcentage = bdcData.remisePourcentage || 0;
    const { total, remiseMontant, totalNet } = calculateTotals(
      lignesProcessed,
      remisePourcentage
    );

    // Générer le numéro de BDC
    const numero = await getNextBdcNumber();

    // Construire le payload en évitant les valeurs undefined (Firestore ne les accepte pas)
    const payload: Record<string, unknown> = {
      numero,
      clientId: bdcData.clientId,
      clientNom: bdcData.clientNom,
      dateCommande: Timestamp.fromDate(bdcData.dateCommande),
      lignes: lignesProcessed,
      total,
      remisePourcentage,
      remiseMontant,
      totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      lieu: bdcData.lieu || "Siguiri",
      fournisseur: bdcData.fournisseur || "Mr Balla TRAORE",
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (bdcData.proformaId) {
      payload.proformaId = bdcData.proformaId;
    }
    if (bdcData.proformaNumero) {
      payload.proformaNumero = bdcData.proformaNumero;
    }
    if (bdcData.dateLivraisonSouhaitee) {
      payload.dateLivraisonSouhaitee = bdcData.dateLivraisonSouhaitee;
    }
    if (bdcData.notes) {
      payload.notes = bdcData.notes;
    }
    if (bdcData.conditionsPaiement) {
      payload.conditionsPaiement = bdcData.conditionsPaiement;
    }

    const bdcsRef = collection(db, BDC_COLLECTION_NAME);
    const docRef = await addDoc(bdcsRef, payload);

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du BDC:", error);
    throw new Error("Impossible de créer le BDC");
  }
}

/**
 * Créer un BDC depuis un proforma validé
 */
export async function createBdcFromProforma(
  proformaId: string
): Promise<string> {
  try {
    // Récupérer le proforma
    const proforma = await getProforma(proformaId);

    // Vérifier que le proforma est validé
    if (proforma.statut !== "VALIDE") {
      throw new Error("Seuls les proformas validés peuvent générer un BDC");
    }

    // Créer le BDC avec les données du proforma
    const bdcData: CreateBdcInput = {
      proformaId: proforma.id,
      proformaNumero: proforma.numero,
      clientId: proforma.clientId,
      clientNom: proforma.clientNom,
      dateCommande: new Date(),
      dateLivraisonSouhaitee: proforma.dateLivraison,
      lignes: proforma.lignes.map((ligne) => ({
        designation: ligne.designation,
        unite: ligne.unite,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
      })),
      remisePourcentage: proforma.remisePourcentage,
      lieu: proforma.lieu,
      fournisseur: proforma.fournisseur,
    };

    return await createBdc(bdcData);
  } catch (error) {
    console.error("Erreur lors de la création du BDC depuis proforma:", error);
    throw error;
  }
}

/**
 * Mettre à jour un BDC (seulement si statut BROUILLON)
 */
export async function updateBdc(bdcData: UpdateBdcInput): Promise<void> {
  try {
    const { id, ...updateData } = bdcData;
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);

    // Vérifier que le BDC est en mode BROUILLON
    const currentBdc = await getDoc(bdcDoc);
    if (!currentBdc.exists()) {
      throw new Error("BDC introuvable");
    }

    if (currentBdc.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de modifier un BDC qui n'est pas en mode BROUILLON"
      );
    }

    // Préparer les données de mise à jour
    const updatePayload: Record<string, unknown> = {
      dateModification: serverTimestamp(),
    };

    if (updateData.clientId) updatePayload.clientId = updateData.clientId;
    if (updateData.clientNom) updatePayload.clientNom = updateData.clientNom;
    if (updateData.dateCommande)
      updatePayload.dateCommande = Timestamp.fromDate(updateData.dateCommande);
    if (updateData.dateLivraisonSouhaitee)
      updatePayload.dateLivraisonSouhaitee = updateData.dateLivraisonSouhaitee;
    if (updateData.notes) updatePayload.notes = updateData.notes;
    if (updateData.conditionsPaiement)
      updatePayload.conditionsPaiement = updateData.conditionsPaiement;
    if (updateData.lieu) updatePayload.lieu = updateData.lieu;
    if (updateData.fournisseur)
      updatePayload.fournisseur = updateData.fournisseur;

    // Si les lignes sont modifiées, recalculer tout
    if (updateData.lignes) {
      const lignesProcessed = processLignes(updateData.lignes);
      const remisePourcentage =
        updateData.remisePourcentage !== undefined
          ? updateData.remisePourcentage
          : currentBdc.data().remisePourcentage || 0;

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
      const lignes = currentBdc.data().lignes || [];
      const { total, remiseMontant, totalNet } = calculateTotals(
        lignes,
        updateData.remisePourcentage
      );

      updatePayload.remisePourcentage = updateData.remisePourcentage;
      updatePayload.remiseMontant = remiseMontant;
      updatePayload.totalNet = totalNet;
    }

    await updateDoc(bdcDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du BDC:", error);
    throw error;
  }
}

/**
 * Changer le statut d'un BDC
 */
export async function updateBdcStatut(
  data: UpdateBdcStatutInput
): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, data.id);

    const updatePayload: Record<string, unknown> = {
      statut: data.statut,
      dateModification: serverTimestamp(),
    };

    if (data.statut === "ENVOYE" && data.dateEnvoi) {
      updatePayload.dateEnvoi = Timestamp.fromDate(data.dateEnvoi);
    }

    if (data.statut === "APPROUVE" && data.dateApprobation) {
      updatePayload.dateApprobation = Timestamp.fromDate(data.dateApprobation);
    }

    if (data.statut === "ANNULE" && data.dateAnnulation) {
      updatePayload.dateAnnulation = Timestamp.fromDate(data.dateAnnulation);
    }

    await updateDoc(bdcDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du BDC");
  }
}

/**
 * Supprimer un BDC (seulement si statut BROUILLON)
 */
export async function deleteBdc(id: string): Promise<void> {
  try {
    const bdcDoc = doc(db, BDC_COLLECTION_NAME, id);

    // Vérifier que le BDC est en mode BROUILLON
    const currentBdc = await getDoc(bdcDoc);
    if (!currentBdc.exists()) {
      throw new Error("BDC introuvable");
    }

    if (currentBdc.data().statut !== "BROUILLON") {
      throw new Error(
        "Impossible de supprimer un BDC qui n'est pas en mode BROUILLON"
      );
    }

    await deleteDoc(bdcDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du BDC:", error);
    throw error;
  }
}
