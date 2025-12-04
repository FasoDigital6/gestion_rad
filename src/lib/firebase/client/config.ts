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

export const db: Firestore | undefined = app ? getFirestore(app) : undefined;
export const auth_client: Auth | undefined = app ? getAuth(app) : undefined;
export const storage: FirebaseStorage | undefined = app ? getStorage(app) : undefined;
