import { userData } from "@/lib/actions/auth/user";
import { authAdmin, dbAdmin } from "@/lib/firebase/server/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";

export const getUserDataById = async (userId: string) => {
  const userCollections = dbAdmin.collection(USERS_COLLECTION_NAME);
  const userSnapshot = await userCollections.doc(userId).get();
  const userData: userData = {
    id: userSnapshot.id,
    email: userSnapshot.data()?.email,
    name: userSnapshot.data()?.name,
    role: userSnapshot.data()?.role,
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

    const users: userData[] = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data()?.email || "",
      name: doc.data()?.name || "",
      role: doc.data()?.role || "",
    }));

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
