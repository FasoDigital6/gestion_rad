import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { authConfig } from "./lib/firebase/auth/config";

const PUBLIC_PATHS = ["/login", "/api/login"];

export async function middleware(request: NextRequest) {
    const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
    if (isPublicPath) {
        return NextResponse.next();
    }
    return authMiddleware(request, {
        loginPath: "/api/login",
        logoutPath: "/api/logout",
        apiKey: authConfig.apiKey,
        cookieName: authConfig.cookieName,
        cookieSerializeOptions: authConfig.cookieSerializeOptions,
        cookieSignatureKeys: authConfig.cookieSignatureKeys,
        serviceAccount: authConfig.serviceAccount,

        handleValidToken: async ({ token, decodedToken }, headers) => {
            // Gestion des Rôles via Custom Claims
            const role = decodedToken.role as string | undefined;

            // Exemple : Redirection si l'utilisateur est déjà sur /login
            if (request.nextUrl.pathname === "/login") {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            // Exemple : Protection Admin
            if (request.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }

            return NextResponse.next({
                request: {
                    headers,
                },
            });
        },

        handleInvalidToken: async (reason) => {
            console.info("Missing or invalid token:", reason);
            return NextResponse.redirect(new URL("/login", request.url));
        },

        handleError: async (error) => {
            console.error("Auth error", error);
            return NextResponse.redirect(new URL("/login", request.url));
        },
    });
}

export const config = {
    matcher: [
        "/api/login",
        "/api/logout",
        "/",
        "/((?!_next|favicon.ico|api|.*\\.).*)",
    ],
};