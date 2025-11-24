/**
 * API Firebase pour les Factures
 * Selon le cahier des charges RAD - Section 7
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
import { FACTURES_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import {
  Facture,
  CreateFactureInput,
  UpdateFactureInput,
  StatutFacture,
  HistoriqueAction,
  ReferenceDocument,
  LigneDocument,
  AperçuFacture,
} from "@/lib/types";
import { getBDC, ajouterFactureauBDC, mettreAJourQuantitesBDC } from "./bdc";
import { getBL, getBLsNonFactures, marquerBLFacture } from "./bl";

/**
 * Générer un numéro de facture unique
 */
async function genererNumeroFacture(): Promise<string> {
  const year = new Date().getFullYear();
  const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
  const q = query(
    facturesRef,
    where("numero", ">=", `FAC-${year}-`),
    where("numero", "<", `FAC-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `FAC-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `FAC-${year}-${nouveauIncrement}`;
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
 * Agréger les lignes de plusieurs BL
 */
function agregerLignesBL(bls: any[]): LigneDocument[] {
  const lignesMap = new Map<string, LigneDocument>();

  bls.forEach((bl) => {
    bl.lignes.forEach((ligne: LigneDocument) => {
      const key = `${ligne.designation}-${ligne.prixUnitaire}-${ligne.tva || 0}`;

      if (lignesMap.has(key)) {
        const ligneExistante = lignesMap.get(key)!;
        ligneExistante.quantite += ligne.quantite;
        ligneExistante.montantHT += ligne.montantHT;
        ligneExistante.montantTTC =
          ligneExistante.montantTTC! + ligne.montantTTC!;
      } else {
        lignesMap.set(key, { ...ligne });
      }
    });
  });

  return Array.from(lignesMap.values());
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
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        bls: data.bls || [],
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateFacture: data.dateFacture?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate() || new Date(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        conditions: data.conditions,
        montantPaye: data.montantPaye || 0,
        montantRestant: data.montantRestant || 0,
        delaiPaiementJours: data.delaiPaiementJours || 30,
        paiements: data.paiements || [],
        datesDernieresRelances: data.datesDernieresRelances?.map((d: any) => d.toDate()) || [],
        nombreRelances: data.nombreRelances || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return factures;
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    throw new Error("Impossible de récupérer les factures");
  }
}

/**
 * Récupérer une facture par son ID
 */
export async function getFacture(id: string): Promise<Facture> {
  try {
    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, id);
    const factureSnapshot = await getDoc(factureDoc);

    if (!factureSnapshot.exists()) {
      throw new Error("Facture introuvable");
    }

    const data = factureSnapshot.data();
    return {
      id: factureSnapshot.id,
      numero: data.numero,
      clientId: data.clientId,
      clientNom: data.clientNom,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      bls: data.bls || [],
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateFacture: data.dateFacture?.toDate() || new Date(),
      dateEcheance: data.dateEcheance?.toDate() || new Date(),
      dateEnvoi: data.dateEnvoi?.toDate(),
      lignes: data.lignes || [],
      totalHT: data.totalHT || 0,
      totalTVA: data.totalTVA || 0,
      totalTTC: data.totalTTC || 0,
      statut: data.statut,
      notes: data.notes,
      conditions: data.conditions,
      montantPaye: data.montantPaye || 0,
      montantRestant: data.montantRestant || 0,
      delaiPaiementJours: data.delaiPaiementJours || 30,
      paiements: data.paiements || [],
      datesDernieresRelances: data.datesDernieresRelances?.map((d: any) => d.toDate()) || [],
      nombreRelances: data.nombreRelances || 0,
      historique: data.historique || [],
      piecesJointes: data.piecesJointes || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error);
    throw new Error("Impossible de récupérer la facture");
  }
}

/**
 * Récupérer les factures d'un client
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
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        bls: data.bls || [],
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateFacture: data.dateFacture?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate() || new Date(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        conditions: data.conditions,
        montantPaye: data.montantPaye || 0,
        montantRestant: data.montantRestant || 0,
        delaiPaiementJours: data.delaiPaiementJours || 30,
        paiements: data.paiements || [],
        datesDernieresRelances: data.datesDernieresRelances?.map((d: any) => d.toDate()) || [],
        nombreRelances: data.nombreRelances || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return factures;
  } catch (error) {
    console.error("Erreur lors de la récupération des factures du client:", error);
    throw new Error("Impossible de récupérer les factures du client");
  }
}

/**
 * Récupérer les factures d'un BDC
 */
export async function getFacturesByBDC(bdcId: string): Promise<Facture[]> {
  try {
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const q = query(
      facturesRef,
      where("bdcId", "==", bdcId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const factures: Facture[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      factures.push({
        id: doc.id,
        numero: data.numero,
        clientId: data.clientId,
        clientNom: data.clientNom,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        bls: data.bls || [],
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateFacture: data.dateFacture?.toDate() || new Date(),
        dateEcheance: data.dateEcheance?.toDate() || new Date(),
        dateEnvoi: data.dateEnvoi?.toDate(),
        lignes: data.lignes || [],
        totalHT: data.totalHT || 0,
        totalTVA: data.totalTVA || 0,
        totalTTC: data.totalTTC || 0,
        statut: data.statut,
        notes: data.notes,
        conditions: data.conditions,
        montantPaye: data.montantPaye || 0,
        montantRestant: data.montantRestant || 0,
        delaiPaiementJours: data.delaiPaiementJours || 30,
        paiements: data.paiements || [],
        datesDernieresRelances: data.datesDernieresRelances?.map((d: any) => d.toDate()) || [],
        nombreRelances: data.nombreRelances || 0,
        historique: data.historique || [],
        piecesJointes: data.piecesJointes || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
      });
    });

    return factures;
  } catch (error) {
    console.error("Erreur lors de la récupération des factures du BDC:", error);
    throw new Error("Impossible de récupérer les factures du BDC");
  }
}

/**
 * Générer un aperçu de facture avant création
 */
export async function genererApercuFacture(
  bdcId: string,
  blIds: string[]
): Promise<AperçuFacture> {
  try {
    // Récupérer le BDC
    const bdc = await getBDC(bdcId);

    // Récupérer les BL
    const blsPromises = blIds.map((blId) => getBL(blId));
    const bls = await Promise.all(blsPromises);

    // Vérifier que tous les BL appartiennent au même BDC
    const blsInvalides = bls.filter((bl) => bl.bdcId !== bdcId);
    if (blsInvalides.length > 0) {
      throw new Error("Tous les BL doivent appartenir au même BDC");
    }

    // Agréger les lignes
    const lignesAgregees = agregerLignesBL(bls);

    // Calculer les totaux
    const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignesAgregees);

    return {
      bdcId: bdc.id,
      bdcNumero: bdc.numero,
      clientId: bdc.clientId,
      clientNom: bdc.clientNom,
      bls: bls.map((bl) => ({
        id: bl.id,
        numero: bl.numero,
        dateLivraison: bl.dateLivraison,
        montantHT: bl.totalHT,
        montantTTC: bl.totalTTC,
        estDejaFacture: bl.estFacture,
      })),
      lignesAgregees,
      totalHT,
      totalTVA,
      totalTTC,
    };
  } catch (error) {
    console.error("Erreur lors de la génération de l'aperçu:", error);
    throw new Error("Impossible de générer l'aperçu de la facture");
  }
}

/**
 * Créer une nouvelle facture
 */
export async function createFacture(
  factureData: CreateFactureInput,
  userId: string
): Promise<string> {
  try {
    // Récupérer le BDC et les BL
    const bdc = await getBDC(factureData.bdcId);
    const blsPromises = factureData.blIds.map((blId) => getBL(blId));
    const bls = await Promise.all(blsPromises);

    // Vérifier que tous les BL appartiennent au BDC et ne sont pas déjà facturés
    bls.forEach((bl) => {
      if (bl.bdcId !== factureData.bdcId) {
        throw new Error(`Le BL ${bl.numero} n'appartient pas au BDC ${bdc.numero}`);
      }
      if (bl.estFacture) {
        throw new Error(`Le BL ${bl.numero} est déjà facturé`);
      }
    });

    // Générer le numéro de facture
    const numero = await genererNumeroFacture();

    // Agréger les lignes des BL
    const lignes = agregerLignesBL(bls);

    // Calculer les totaux
    const { totalHT, totalTVA, totalTTC } = calculerTotaux(lignes);

    // Calculer la date d'échéance
    const dateEcheance = new Date(factureData.dateFacture);
    dateEcheance.setDate(
      dateEcheance.getDate() + factureData.delaiPaiementJours
    );

    // Créer les références des BL
    const blRefs: ReferenceDocument[] = bls.map((bl) => ({
      id: bl.id,
      numero: bl.numero,
      type: "bl",
      date: bl.dateLivraison,
    }));

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création de la facture"),
      creerActionHistorique(
        "regroupement_bl",
        userId,
        `Facture créée à partir de ${bls.length} BL: ${bls.map((bl) => bl.numero).join(", ")}`
      ),
    ];

    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const docRef = await addDoc(facturesRef, {
      numero,
      clientId: bdc.clientId,
      clientNom: bdc.clientNom,
      bdcId: factureData.bdcId,
      bdcNumero: bdc.numero,
      bls: blRefs,
      dateCreation: serverTimestamp(),
      dateFacture: Timestamp.fromDate(factureData.dateFacture),
      dateEcheance: Timestamp.fromDate(dateEcheance),
      lignes,
      totalHT,
      totalTVA,
      totalTTC,
      statut: "brouillon" as StatutFacture,
      notes: factureData.notes,
      conditions: factureData.conditions,
      montantPaye: 0,
      montantRestant: totalTTC,
      delaiPaiementJours: factureData.delaiPaiementJours,
      paiements: [],
      datesDernieresRelances: [],
      nombreRelances: 0,
      historique,
      piecesJointes: [],
      creePar: userId,
    });

    // Marquer les BL comme facturés
    const factureRef: ReferenceDocument = {
      id: docRef.id,
      numero,
      type: "facture",
      date: factureData.dateFacture,
    };

    for (const bl of bls) {
      await marquerBLFacture(bl.id, factureRef, bl.totalTTC, userId);
    }

    // Mettre à jour les quantités facturées du BDC
    const quantiteFacturee = lignes.reduce(
      (sum, ligne) => sum + ligne.quantite,
      0
    );
    await mettreAJourQuantitesBDC(
      factureData.bdcId,
      undefined,
      quantiteFacturee,
      userId
    );

    // Ajouter la référence de la facture au BDC
    await ajouterFactureauBDC(factureData.bdcId, factureRef, userId);

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw new Error("Impossible de créer la facture");
  }
}

/**
 * Mettre à jour une facture
 */
export async function updateFacture(
  factureData: UpdateFactureInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = factureData;
    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, id);

    // Vérifier que la facture n'est pas déjà payée
    const factureSnapshot = await getDoc(factureDoc);
    if (!factureSnapshot.exists()) {
      throw new Error("Facture introuvable");
    }

    if (factureSnapshot.data().montantPaye > 0) {
      throw new Error(
        "Impossible de modifier une facture ayant des paiements"
      );
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    if (updateData.dateFacture) {
      dataToUpdate.dateFacture = Timestamp.fromDate(updateData.dateFacture);

      // Recalculer la date d'échéance si le délai est fourni
      if (updateData.delaiPaiementJours !== undefined) {
        const dateEcheance = new Date(updateData.dateFacture);
        dateEcheance.setDate(
          dateEcheance.getDate() + updateData.delaiPaiementJours
        );
        dataToUpdate.dateEcheance = Timestamp.fromDate(dateEcheance);
        dataToUpdate.delaiPaiementJours = updateData.delaiPaiementJours;
      }
    }

    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.conditions !== undefined)
      dataToUpdate.conditions = updateData.conditions;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const currentHistorique = factureSnapshot.data().historique || [];
    const nouvelleAction = creerActionHistorique(
      "modification",
      userId,
      "Modification de la facture"
    );
    dataToUpdate.historique = [...currentHistorique, nouvelleAction];

    await updateDoc(factureDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    throw new Error("Impossible de mettre à jour la facture");
  }
}

/**
 * Changer le statut d'une facture
 */
export async function changerStatutFacture(
  id: string,
  statut: StatutFacture,
  userId: string
): Promise<void> {
  try {
    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, id);
    const factureSnapshot = await getDoc(factureDoc);

    if (!factureSnapshot.exists()) {
      throw new Error("Facture introuvable");
    }

    const currentHistorique = factureSnapshot.data().historique || [];
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

    // Si le statut est "envoyee", enregistrer la date d'envoi
    if (statut === "envoyee") {
      updateData.dateEnvoi = serverTimestamp();
    }

    await updateDoc(factureDoc, updateData);
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut de la facture");
  }
}

/**
 * Supprimer une facture
 */
export async function deleteFacture(id: string): Promise<void> {
  try {
    // Vérifier que la facture n'a pas de paiements
    const facture = await getFacture(id);
    if (facture.montantPaye > 0) {
      throw new Error(
        "Impossible de supprimer une facture ayant des paiements"
      );
    }

    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, id);
    await deleteDoc(factureDoc);

    // TODO: Démarquer les BL comme non facturés
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error);
    throw new Error("Impossible de supprimer la facture");
  }
}

/**
 * Enregistrer un paiement sur une facture
 * Cette fonction est appelée depuis l'API des paiements
 */
export async function enregistrerPaiementFacture(
  factureId: string,
  paiementRef: ReferenceDocument,
  montantPaiement: number,
  userId: string
): Promise<void> {
  try {
    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, factureId);
    const factureSnapshot = await getDoc(factureDoc);

    if (!factureSnapshot.exists()) {
      throw new Error("Facture introuvable");
    }

    const data = factureSnapshot.data();
    const nouveauMontantPaye = (data.montantPaye || 0) + montantPaiement;
    const nouveauMontantRestant = data.totalTTC - nouveauMontantPaye;

    // Déterminer le nouveau statut
    let nouveauStatut: StatutFacture = data.statut;
    if (nouveauMontantRestant <= 0) {
      nouveauStatut = "payee";
    } else if (nouveauMontantPaye > 0) {
      nouveauStatut = "partiellement_payee";
    }

    const currentPaiements = data.paiements || [];
    const currentHistorique = data.historique || [];
    const nouvelleAction = creerActionHistorique(
      "paiement",
      userId,
      `Paiement de ${montantPaiement} FCFA reçu (${paiementRef.numero})`
    );

    await updateDoc(factureDoc, {
      paiements: [...currentPaiements, paiementRef],
      montantPaye: nouveauMontantPaye,
      montantRestant: nouveauMontantRestant,
      statut: nouveauStatut,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement du paiement:",
      error
    );
    throw new Error("Impossible d'enregistrer le paiement");
  }
}

/**
 * Enregistrer une relance
 */
export async function enregistrerRelance(
  factureId: string,
  userId: string
): Promise<void> {
  try {
    const factureDoc = doc(db, FACTURES_COLLECTION_NAME, factureId);
    const factureSnapshot = await getDoc(factureDoc);

    if (!factureSnapshot.exists()) {
      throw new Error("Facture introuvable");
    }

    const data = factureSnapshot.data();
    const currentRelances = data.datesDernieresRelances || [];
    const currentHistorique = data.historique || [];
    const nouvelleAction = creerActionHistorique(
      "relance",
      userId,
      `Relance envoyée (${currentRelances.length + 1}ème relance)`
    );

    await updateDoc(factureDoc, {
      datesDernieresRelances: [...currentRelances, serverTimestamp()],
      nombreRelances: currentRelances.length + 1,
      historique: [...currentHistorique, nouvelleAction],
      dateModification: serverTimestamp(),
      modifiePar: userId,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la relance:", error);
    throw new Error("Impossible d'enregistrer la relance");
  }
}
