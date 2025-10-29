import {db} from "../../../../../configs/db";
import {usersTable} from "../../../../../configs/schema";
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/jwt"
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return Response.json({ error: "Missing email or password" }, { status: 400 })
        }

        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1)

        const user = existingUsers[0]

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 })
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return Response.json({ error: "Invalid password" }, { status: 401 })
        }

        const token = generateToken({ email: user.email, userName: user.userName })

        const res = NextResponse.json({
            message: "Logged in",
            user: {
                email: user.email,
                userName: user.userName,
            }
        })

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 неделя
        })

        return res
    } catch (err: any) {
        console.error("🚨 Login error:", err)
        return Response.json({ error: "Internal Server Error", details: err.message }, { status: 500 })
    }
}
