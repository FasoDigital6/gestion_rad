import { getApps, initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import configuration from "@/configurations";

const { firebase } = configuration;

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebase);

export const db = getFirestore(app);
export const auth_client = getAuth(app);
export const storage = getStorage(app);
