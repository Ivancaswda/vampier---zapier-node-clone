import {db} from "../../../../../configs/db";
import {usersTable} from "../../../../../configs/schema";
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/jwt"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email, password, userName } = await req.json()

        if (!email || !password || !userName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1)

        if (existingUsers.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 })
        }

        const hashed = await bcrypt.hash(password, 10)


        await db.insert(usersTable).values({

            userName,
            email,
            password: hashed,
            avatarUrl: null

        })

        const token = generateToken({ email, userName })

        const res = NextResponse.json({
            message: "Registered",
            user: {
                email,
                userName,
                avatarUrl: null,
                createdAt: new Date()
            },
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
        console.error("🚨 Registration error:", err)
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500 }
        )
    }
}