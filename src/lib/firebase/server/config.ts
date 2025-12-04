
import "server-only";

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth'
import configuration from '@/configurations';

const projectId = configuration.firebase.projectId;
const storageBucket = configuration.firebase.storageBucket;

function initializeFirebaseAdmin(): App | null {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Only initialize if we have the required environment variables
    const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
    const clientEmail = process.env.SERVICE_ACCOUNT_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
        // During build time, these won't be available, so skip initialization
        return null;
    }

    return initializeApp({
        credential: cert({
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            projectId,
        }),
        storageBucket,
    });
}

// Initialize Firebase Admin
const app = initializeFirebaseAdmin();

// Only get services if app is initialized
// Use type assertions for build-time compatibility
export const dbAdmin = (app ? getFirestore() : null) as Firestore;
export const authAdmin = (app ? getAuth() : null) as Auth;