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
  FACTURES_COLLECTION_NAME,
  BDL_COLLECTION_NAME,
  CLIENTS_COLLECTION_NAME,
  COUNTERS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import type {
  Facture,
  FactureLigne,
  CreateFactureFromBdlsInput,
  CreateFactureManueleInput,
  UpdateFactureInput,
  UpdateFactureStatutInput,
} from "@/lib/types/facture";
import type { Bdl } from "@/lib/types/bdl";
import { getBdl } from "./bdl";
import {
  calculateFactureTotals,
  calculateLignePrixTotal,
} from "@/lib/utils/facture";

/**
 * Génère le prochain numéro de facture
 * Format: "001/FACT/2025"
 */
async function getNextFactureNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `FACT-${year}`;

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
    return `${numeroFormatted}/FACT/${year}`;
  });
}

/**
 * Agrège les lignes de plusieurs BDL
 * Fusionne les articles ayant la même désignation
 */
function aggregerLignesBdls(bdls: Bdl[]): FactureLigne[] {
  const lignesMap = new Map<string, FactureLigne>();

  bdls.forEach((bdl) => {
    bdl.lignes.forEach((ligne) => {
      const key = `${ligne.designation}-${ligne.unite}-${ligne.prixUnitaire}`;

      if (lignesMap.has(key)) {
        const existing = lignesMap.get(key)!;
        existing.quantite += ligne.quantiteLivree;
        existing.prixTotal = calculateLignePrixTotal(
          existing.quantite,
          existing.prixUnitaire
        );

        // Ajouter à la traçabilité
        if (!existing.bdlSource) {
          existing.bdlSource = [];
        }
        existing.bdlSource.push({
          bdlId: bdl.id,
          bdlNumero: bdl.numero,
          quantite: ligne.quantiteLivree,
        });
      } else {
        lignesMap.set(key, {
          numero: 0, // Sera assigné plus tard
          designation: ligne.designation,
          unite: ligne.unite,
          quantite: ligne.quantiteLivree,
          prixUnitaire: ligne.prixUnitaire,
          prixTotal: ligne.prixTotal,
          bdlSource: [
            {
              bdlId: bdl.id,
              bdlNumero: bdl.numero,
              quantite: ligne.quantiteLivree,
            },
          ],
        });
      }
    });
  });

  // Assigner les numéros de ligne
  const lignes = Array.from(lignesMap.values());
  lignes.forEach((ligne, index) => {
    ligne.numero = index + 1;
  });

  return lignes;
}

/**
 * Traite les lignes d'une facture manuelle
 */
function processLignesManuelles(
  lignes: Omit<FactureLigne, "numero" | "prixTotal" | "bdlSource">[]
): FactureLigne[] {
  return lignes.map((ligne, index) => ({
    ...ligne,
    numero: index + 1,
    prixTotal: calculateLignePrixTotal(ligne.quantite, ligne.prixUnitaire),
  }));
}

/**
 * Récupérer toutes les factures
 */
export async function getFactures(): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const q = query(facturesRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const factures: Facture[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      factures.push({
        id: doc.id,
        ...data,
        dateEmission: data.dateEmission?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEmise: data.dateEmise?.toDate(),
        datePayeeComplete: data.datePayeeComplete?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
      } as Facture);
    });

    return factures;
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    throw error;
  }
}

/**
 * Récupérer une facture par ID
 */
export async function getFacture(id: string): Promise<Facture> {
  try {
    const factureRef = doc(db, FACTURES_COLLECTION_NAME, id);
    const factureDoc = await getDoc(factureRef);

    if (!factureDoc.exists()) {
      throw new Error("Facture non trouvée");
    }

    const data = factureDoc.data();
    return {
      id: factureDoc.id,
      ...data,
      dateEmission: data.dateEmission?.toDate() || new Date(),
      dateEcheance: data.dateEcheance?.toDate(),
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateModification: data.dateModification?.toDate(),
      dateEmise: data.dateEmise?.toDate(),
      datePayeeComplete: data.datePayeeComplete?.toDate(),
      dateAnnulation: data.dateAnnulation?.toDate(),
    } as Facture;
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error);
    throw error;
  }
}

/**
 * Récupérer toutes les factures d'un client
 */
export async function getFacturesByClient(clientId: string): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const q = query(
      facturesRef,
      where("clientId", "==", clientId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const factures: Facture[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      factures.push({
        id: doc.id,
        ...data,
        dateEmission: data.dateEmission?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEmise: data.dateEmise?.toDate(),
        datePayeeComplete: data.datePayeeComplete?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
      } as Facture);
    });

    return factures;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des factures du client:",
      error
    );
    throw error;
  }
}

/**
 * Créer une facture depuis un ou plusieurs BDL
 */
export async function createFactureFromBdls(
  input: CreateFactureFromBdlsInput
): Promise<string> {
  try {
    // 1. Récupérer tous les BDL
    const bdls: Bdl[] = [];
    for (const bdlId of input.bdlIds) {
      const bdl = await getBdl(bdlId);
      bdls.push(bdl);
    }

    // 2. Validations
    if (bdls.length === 0) {
      throw new Error("Aucun BDL sélectionné");
    }

    // Vérifier que tous les BDL sont livrés
    const nonLivres = bdls.filter((bdl) => bdl.statut !== "LIVRE");
    if (nonLivres.length > 0) {
      throw new Error(
        `Tous les BDL doivent être en statut LIVRE. BDL non livrés: ${nonLivres.map((b) => b.numero).join(", ")}`
      );
    }

    // Vérifier que tous les BDL appartiennent au même client
    const clientIds = new Set(bdls.map((bdl) => bdl.clientId));
    if (clientIds.size > 1) {
      throw new Error(
        "Tous les BDL doivent appartenir au même client pour créer une facture"
      );
    }

    // Vérifier qu'aucun BDL n'est déjà facturé
    const dejaFactures = bdls.filter((bdl) => bdl.factureId);
    if (dejaFactures.length > 0) {
      throw new Error(
        `Certains BDL sont déjà facturés: ${dejaFactures.map((b) => b.numero).join(", ")}`
      );
    }

    // 3. Agréger les lignes
    const lignes = aggregerLignesBdls(bdls);

    // 4. Calculer les totaux
    const remisePourcentage = input.remisePourcentage ?? bdls[0].remisePourcentage;
    const totals = calculateFactureTotals(lignes, remisePourcentage, 0);

    // 5. Générer le numéro
    const numero = await getNextFactureNumber();

    // 6. Préparer les données
    const clientId = bdls[0].clientId;
    const clientNom = bdls[0].clientNom;
    const lieu = input.lieu || bdls[0].lieu;
    const fournisseur = input.fournisseur || bdls[0].fournisseur;

    const factureData = {
      numero,
      bdlIds: input.bdlIds,
      bdlNumeros: bdls.map((b) => b.numero),
      clientId,
      clientNom,
      dateEmission: Timestamp.fromDate(input.dateEmission),
      dateEcheance: input.dateEcheance
        ? Timestamp.fromDate(input.dateEcheance)
        : null,
      lignes,
      total: totals.total,
      remisePourcentage,
      remiseMontant: totals.remiseMontant,
      totalNet: totals.totalNet,
      totalPaye: 0,
      soldeRestant: totals.totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      conditionsPaiement: input.conditionsPaiement || null,
      notes: input.notes || null,
      lieu,
      fournisseur,
    };

    // 7. Transaction: créer facture et marquer BDL
    return await runTransaction(db, async (transaction) => {
      // Créer la facture
      const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
      const factureRef = doc(facturesRef);
      transaction.set(factureRef, factureData);

      // Marquer les BDL comme facturés
      for (const bdl of bdls) {
        const bdlRef = doc(db, BDL_COLLECTION_NAME, bdl.id);
        transaction.update(bdlRef, {
          factureId: factureRef.id,
          dateModification: serverTimestamp(),
        });
      }

      return factureRef.id;
    });
  } catch (error) {
    console.error("Erreur lors de la création de la facture depuis BDL:", error);
    throw error;
  }
}

/**
 * Créer une facture manuellement
 */
export async function createFactureManuelle(
  input: CreateFactureManueleInput
): Promise<string> {
  try {
    // 1. Traiter les lignes
    const lignes = processLignesManuelles(input.lignes);

    if (lignes.length === 0) {
      throw new Error("La facture doit contenir au moins une ligne");
    }

    // 2. Calculer les totaux
    const remisePourcentage = input.remisePourcentage ?? 0;
    const totals = calculateFactureTotals(lignes, remisePourcentage, 0);

    // 3. Générer le numéro
    const numero = await getNextFactureNumber();

    // 4. Préparer les données
    const factureData = {
      numero,
      clientId: input.clientId,
      clientNom: input.clientNom,
      dateEmission: Timestamp.fromDate(input.dateEmission),
      dateEcheance: input.dateEcheance
        ? Timestamp.fromDate(input.dateEcheance)
        : null,
      lignes,
      total: totals.total,
      remisePourcentage,
      remiseMontant: totals.remiseMontant,
      totalNet: totals.totalNet,
      totalPaye: 0,
      soldeRestant: totals.totalNet,
      dateCreation: serverTimestamp(),
      statut: "BROUILLON",
      conditionsPaiement: input.conditionsPaiement || null,
      notes: input.notes || null,
      lieu: input.lieu || "Siguiri",
      fournisseur: input.fournisseur || "Mr Balla TRAORE",
    };

    // 5. Créer la facture
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const factureRef = await addDoc(facturesRef, factureData);

    return factureRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la facture manuelle:", error);
    throw error;
  }
}

/**
 * Mettre à jour une facture (seulement BROUILLON)
 */
export async function updateFacture(
  input: UpdateFactureInput
): Promise<void> {
  try {
    const facture = await getFacture(input.id);

    if (facture.statut !== "BROUILLON") {
      throw new Error(
        "Seules les factures en brouillon peuvent être modifiées"
      );
    }

    const factureRef = doc(db, FACTURES_COLLECTION_NAME, input.id);

    // Recalculer les totaux si les lignes ont changé
    let updateData: Record<string, unknown> = {
      ...input,
      dateModification: serverTimestamp(),
    };

    if (input.lignes) {
      const lignes = input.lignes.map((ligne, index) => ({
        ...ligne,
        numero: index + 1,
        prixTotal: calculateLignePrixTotal(ligne.quantite, ligne.prixUnitaire),
      }));

      const remisePourcentage = input.remisePourcentage ?? facture.remisePourcentage;
      const totals = calculateFactureTotals(lignes, remisePourcentage, 0);

      updateData = {
        ...updateData,
        lignes,
        total: totals.total,
        remiseMontant: totals.remiseMontant,
        totalNet: totals.totalNet,
        soldeRestant: totals.totalNet,
      };
    }

    delete updateData.id;
    await updateDoc(factureRef, updateData);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    throw error;
  }
}

/**
 * Changer le statut d'une facture
 */
export async function updateFactureStatut(
  input: UpdateFactureStatutInput
): Promise<void> {
  try {
    const facture = await getFacture(input.id);

    return await runTransaction(db, async (transaction) => {
      const factureRef = doc(db, FACTURES_COLLECTION_NAME, input.id);
      const clientRef = doc(db, CLIENTS_COLLECTION_NAME, facture.clientId);

      const updateData: Record<string, unknown> = {
        statut: input.statut,
        dateModification: serverTimestamp(),
      };

      // Passage à EMISE
      if (input.statut === "EMISE" && facture.statut === "BROUILLON") {
        updateData.dateEmise = input.dateEmise
          ? Timestamp.fromDate(input.dateEmise)
          : serverTimestamp();

        // Mettre à jour les totaux du client
        const clientDoc = await transaction.get(clientRef);
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          transaction.update(clientRef, {
            totalFacture: (clientData.totalFacture || 0) + facture.totalNet,
            totalDu: (clientData.totalDu || 0) + facture.totalNet,
          });
        }
      }

      // Passage à ANNULEE
      if (input.statut === "ANNULEE") {
        updateData.dateAnnulation = input.dateAnnulation
          ? Timestamp.fromDate(input.dateAnnulation)
          : serverTimestamp();
        updateData.motifAnnulation = input.motifAnnulation || null;

        // Si la facture était émise ou payée partiellement, ajuster les totaux client
        if (facture.statut === "EMISE" || facture.statut === "PAYEE_PARTIELLE" || facture.statut === "PAYEE") {
          const clientDoc = await transaction.get(clientRef);
          if (clientDoc.exists()) {
            const clientData = clientDoc.data();
            transaction.update(clientRef, {
              totalFacture: (clientData.totalFacture || 0) - facture.totalNet,
              totalPaye: (clientData.totalPaye || 0) - facture.totalPaye,
              totalDu: (clientData.totalDu || 0) - facture.soldeRestant,
            });
          }
        }

        // Démarquer les BDL si la facture vient de BDL
        if (facture.bdlIds && facture.bdlIds.length > 0) {
          for (const bdlId of facture.bdlIds) {
            const bdlRef = doc(db, BDL_COLLECTION_NAME, bdlId);
            transaction.update(bdlRef, {
              factureId: null,
              dateModification: serverTimestamp(),
            });
          }
        }
      }

      // Passage à PAYEE
      if (input.statut === "PAYEE") {
        updateData.datePayeeComplete = input.datePayeeComplete
          ? Timestamp.fromDate(input.datePayeeComplete)
          : serverTimestamp();
      }

      transaction.update(factureRef, updateData);
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut de la facture:", error);
    throw error;
  }
}

/**
 * Supprimer une facture (seulement BROUILLON)
 */
export async function deleteFacture(id: string): Promise<void> {
  try {
    const facture = await getFacture(id);

    if (facture.statut !== "BROUILLON") {
      throw new Error(
        "Seules les factures en brouillon peuvent être supprimées"
      );
    }

    const factureRef = doc(db, FACTURES_COLLECTION_NAME, id);
    await deleteDoc(factureRef);
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error);
    throw error;
  }
}

/**
 * Trouver les factures contenant un BDL spécifique
 */
export async function getFacturesFromBdl(bdlId: string): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const q = query(
      facturesRef,
      where("bdlIds", "array-contains", bdlId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const factures: Facture[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      factures.push({
        id: doc.id,
        ...data,
        dateEmission: data.dateEmission?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        dateEmise: data.dateEmise?.toDate(),
        datePayeeComplete: data.datePayeeComplete?.toDate(),
        dateAnnulation: data.dateAnnulation?.toDate(),
      } as Facture);
    });

    return factures;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des factures du BDL:",
      error
    );
    throw error;
  }
}
