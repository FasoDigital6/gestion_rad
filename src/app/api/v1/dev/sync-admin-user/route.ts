import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebase/server/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";

export const dynamic = 'force-dynamic';

/**
 * API de développement pour synchroniser l'utilisateur admin dans Firestore
 * Utilise l'email mabiri@radguinee.com
 */
export async function GET() {
  try {
    const email = "mabiri@radguinee.com";

    // Récupérer l'utilisateur depuis Firebase Auth
    const userRecord = await authAdmin.getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé dans Firebase Auth" },
        { status: 404 }
      );
    }

    // Vérifier si le document existe dans Firestore
    const userDoc = await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userRecord.uid)
      .get();

    if (userDoc.exists) {
      return NextResponse.json({
        message: "L'utilisateur existe déjà dans Firestore",
        user: {
          id: userDoc.id,
          ...userDoc.data(),
        },
      });
    }

    // Créer le document dans Firestore
    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userRecord.uid)
      .set({
        email: userRecord.email,
        name: userRecord.displayName || "Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({
      message: "Utilisateur synchronisé avec succès dans Firestore",
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || "Admin",
        role: "admin",
      },
    });
  } catch (error: unknown) {
    console.error("Error syncing admin user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    );
  }
}
