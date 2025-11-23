import { cookies } from "next/headers";


import { User } from "@/lib/actions/auth/user";
import { authConfig } from "@/lib/firebase/auth/config";
import { getTokens } from "next-firebase-auth-edge";

import { getUserDataById } from "./user_queries";

import { Tokens } from "next-firebase-auth-edge";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";



export const toUser = ({ token, customToken, decodedToken }: Tokens): User => {
    const {
        uid,
        email,
        picture: photoURL,
        email_verified: emailVerified,
        phone_number: phoneNumber,
        name: displayName,
        source_sign_in_provider: signInProvider,
    } = decodedToken;

    const customClaims = filterStandardClaims(decodedToken);

    return {
        uid,
        email: email ?? null,
        displayName: displayName ?? null,
        photoURL: photoURL ?? null,
        phoneNumber: phoneNumber ?? null,
        providerId: signInProvider,
        idToken: token,
        customToken: customToken as string,
        role: customClaims.role as string,
    };
};


/**
 * Gets the currently authenticated user with merged auth and database data
 * @returns Combined user information or null if not authenticated
 */
export async function getCurrentUser(): Promise<
    (User) | null
> {
    const tokens = await getTokens(await cookies(), {
        ...authConfig,
    });

    const user = tokens ? toUser(tokens) : null;

    if (!user) {
        return null;
    }

    const userData = await getUserDataById(user.uid);

    // Merge auth user with database user data
    // Use the database email if the auth email is null
    return {
        ...user,
        ...userData,
        // Ensure email is never null after merging
        email: user.email || userData.email,
    };
}


