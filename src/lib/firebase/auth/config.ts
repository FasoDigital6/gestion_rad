import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirebaseAuth } from "next-firebase-auth-edge";

export const serverConfig = {
    useSecureCookies: process.env.USE_SECURE_COOKIES === "true",
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    serviceAccount: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
        ? {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
            clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL || '',
            privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(
                /\\n/g,
                "\n"
            ),
        }
        : undefined,
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

//verify if the the app is already initialized
let app = getApps().length > 0 ? getApps()[0] : null;
if (!app && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
}
// Type assertion for runtime use - will be undefined during build but available at runtime
export const auth = (app ? getAuth(app) : undefined) as ReturnType<typeof getAuth>;

const _authConfig = serverConfig.firebaseApiKey ? {
    apiKey: serverConfig.firebaseApiKey,
    cookieName: process.env.AUTH_COOKIE_NAME || 'auth',
    cookieSignatureKeys: [
        process.env.COOKIE_SECRET_CURRENT || '',
        process.env.COOKIE_SECRET_PREVIOUS || '',
    ],
    cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
        sameSite: "lax" as const,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
    serviceAccount: serverConfig.serviceAccount,
    debug: true,
} : undefined;

// Type assertion for runtime use
export const authConfig = _authConfig as NonNullable<typeof _authConfig>;
export const auth_client = (_authConfig ? getFirebaseAuth(_authConfig) : undefined) as ReturnType<typeof getFirebaseAuth>;
