import { getApps, initializeApp, FirebaseApp } from "firebase/app";

import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import configuration from "@/configurations";

const { firebase } = configuration;

// Only initialize if we have a valid API key
let app: FirebaseApp | undefined;
if (getApps().length > 0) {
    app = getApps()[0];
} else if (firebase.apiKey) {
    app = initializeApp(firebase);
}

// These will be undefined during build time but available at runtime
// Using type assertions to avoid TypeScript errors in runtime code
export const db = (app ? getFirestore(app) : undefined) as Firestore;
export const auth_client = (app ? getAuth(app) : undefined) as Auth;
export const storage = (app ? getStorage(app) : undefined) as FirebaseStorage;
