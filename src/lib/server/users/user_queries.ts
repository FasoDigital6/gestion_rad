import { userData } from "@/lib/actions/auth/user";
import { authAdmin, dbAdmin } from "@/lib/firebase/server/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";

export const getUserDataById = async (userId: string) => {
  const userCollections = dbAdmin.collection(USERS_COLLECTION_NAME);
  const userSnapshot = await userCollections.doc(userId).get();
  const data = userSnapshot.data();
  const userData: userData = {
    id: userSnapshot.id,
    email: data?.email || "",
    name: data?.name || "",
    nom: data?.nom,
    prenom: data?.prenom,
    telephone: data?.telephone,
    poste: data?.poste,
    adresse: data?.adresse,
    role: data?.role || "user",
    disabled: data?.disabled || false,
    createdAt: data?.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate().toISOString()) : undefined,
  };
  return userData;
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await authAdmin.getUserByEmail(email);
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await authAdmin.getUser(id);
    return user;
  } catch {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const userCollections = dbAdmin.collection(USERS_COLLECTION_NAME);
    const usersSnapshot = await userCollections.get();

    const users: userData[] = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data?.email || "",
        name: data?.name || "",
        nom: data?.nom,
        prenom: data?.prenom,
        telephone: data?.telephone,
        poste: data?.poste,
        adresse: data?.adresse,
        role: data?.role || "user",
        disabled: data?.disabled || false,
        createdAt: data?.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate().toISOString()) : undefined,
      };
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
