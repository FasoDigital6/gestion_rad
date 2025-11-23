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
