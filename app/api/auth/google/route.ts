import { NextResponse} from "next/server";
import {usersTable} from "../../../../../configs/schema";

import {eq} from "drizzle-orm";
import {generateToken} from "@/lib/jwt";
import bcrypt from "bcryptjs";
import {db} from "../../../../../configs/db";
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, userName, avatarUrl } = body;

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        let user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user.length) {
            const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);

            await db.insert(usersTable).values({
                userName,
                email,
                password: tempPassword,
                avatarUrl,
                createdAt: new Date(),
            });
        }

        const jwtToken = generateToken({ email, userName });

        const res = NextResponse.json({
            user: { email, userName, avatarUrl },
            token: jwtToken,
        });

        res.cookies.set('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error: any) {
        console.error('failed to login via google', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}