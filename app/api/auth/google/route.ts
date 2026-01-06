import { NextResponse } from "next/server";
import {db} from "@/configs/db";
import { usersTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        const { access_token } = await req.json();

        if (!access_token) {
            return NextResponse.json({ error: "Missing Google access token" }, { status: 400 });
        }


        const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!googleRes.ok) {
            return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
        }

        const googleUser = await googleRes.json();

        const { email, name, picture } = googleUser;


        const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        let user;

        if (existingUsers.length === 0) {

            const inserted = await db
                .insert(usersTable)
                .values({
                    userName: name || "Без имени",
                    email,
                    password: "", // не нужен для Google
                    credits: 1,
                    avatarUrl: picture,
                    createdAt: new Date(),
                    isPro: false
                })
                .returning();
            user = inserted[0];
        } else {

            const updated = await db
                .update(usersTable)
                .set({ avatarUrl: picture, name })
                .where(eq(usersTable.email, email))
                .returning();
            user = updated[0];
        }


        const token = generateToken({ email: user.email, userName: user.name });

        const res = NextResponse.json({
            message: "Google login successful",
            token,
            user: {
                email: user.email,
                userName: user.name,
                avatarUrl: user.avatarUrl,
                credits: user.credits,
                isPro: user.isPro
            },
        });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (err) {
        console.error("❌ Google login error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
