"use server";

import { z } from "zod";
import { cookies, headers } from "next/headers";
import { signInWithEmailAndPassword } from "firebase/auth";
import { refreshCookiesWithIdToken } from "next-firebase-auth-edge/lib/next/cookies";
import { auth, authConfig } from "@/lib/firebase/auth/config";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export async function loginAction(formData: z.infer<typeof loginSchema>) {
    // 1. Validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) return { error: "Données invalides" };

    const { email, password } = result.data;

    try {
        // 2. Authentification via Firebase Client SDK
        // Note: On utilise le SDK client ici car il gère le hachage du mot de passe
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 3. Récupération du Token
        const idToken = await userCredential.user.getIdToken();

        // 4. Création du Cookie de Session (via next-firebase-auth-edge)
        await refreshCookiesWithIdToken(idToken, await headers(), await cookies(), authConfig);

        return { success: true };
    } catch (e) {
        return { error: "Email ou mot de passe incorrect." };
    }
}

export async function logoutAction() {
    // Supprimer le cookie est géré par l'appel à /api/logout ou manuellement ici
    // Pour next-firebase-auth-edge, rediriger vers le endpoint API de logout est souvent plus simple
    // ou utiliser removeCookies
}