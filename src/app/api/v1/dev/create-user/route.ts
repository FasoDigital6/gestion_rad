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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
