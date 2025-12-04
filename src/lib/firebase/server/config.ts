
import "server-only";

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth'
import configuration from '@/configurations';

const projectId = configuration.firebase.projectId;
const storageBucket = configuration.firebase.storageBucket;

function initializeFirebaseAdmin() {
    if (!getApps().length) {
        // Only initialize if we have the required environment variables
        const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
        const clientEmail = process.env.SERVICE_ACCOUNT_CLIENT_EMAIL;

        if (!privateKey || !clientEmail) {
            // During build time, these won't be available, so skip initialization
            return;
        }

        initializeApp({
            credential: cert({
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
                projectId,
            }),
            storageBucket,
        });
    }
}

// Initialize Firebase Admin
initializeFirebaseAdmin();

const dbAdmin = getFirestore();
const authAdmin = getAuth()

export { dbAdmin, authAdmin };