import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
import { authConfig } from "./lib/firebase/auth/config";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";

const AUTH_PATHS = ["/login", "/auth/logout"];

const pathStartsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname.startsWith(prefix));

const createNextResponseWithHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  //   headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If authConfig is not available (during build), allow all requests
  if (!authConfig || !authConfig.apiKey) {
    return NextResponse.next();
  }

  //   const isHomePath = pathStartsWith(pathname, HOME_PATHS);

  //   if (isHomePath) {
  //     return NextResponse.next();
  //   }

  const isAuthPath = pathStartsWith(pathname, AUTH_PATHS);

  console.log(isAuthPath, "isAuthPath 😂");

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,

    handleValidToken: async ({ decodedToken }, headers) => {
      // Gestion des Rôles via Custom Claims
      const claims = filterStandardClaims(decodedToken);

      const role = claims.role as string | undefined;
      if (!role) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Exemple : Redirection si l'utilisateur est déjà sur /login
      if (isAuthPath) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    },

    handleInvalidToken: async (reason) => {
      console.info("Missing or invalid token:", reason);

      if (isAuthPath) {
        return createNextResponseWithHeaders(request);
      }
      return NextResponse.redirect(new URL("/login", request.url));
    },

    handleError: async (error) => {
      console.error("Auth error", error);

      if (isAuthPath) {
        return createNextResponseWithHeaders(request);
      }

      return NextResponse.redirect(new URL("/login", request.url));
    },
  });
}

export const config = {
  matcher: [
    "/api/login",
    "/api/logout",
    "/((?!_next|favicon.ico|api|.*\\.).*)",
  ],
};
