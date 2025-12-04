import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase/server/config";

export async function GET(request: Request) {

    try {
        const user = await authAdmin.createUser({
            email: "mabiri@radguinee.com",
            password: "12345678",
            displayName: "mabiri",
        });

        await authAdmin.setCustomUserClaims(user.uid, { role: "admin" });

        return NextResponse.json({
            success: true,
            message: "User created with admin claim",
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "An error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
