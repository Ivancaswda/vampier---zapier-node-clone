import {verifyToken} from "@/lib/jwt";
import {db} from "../../../../../configs/db";
import {usersTable} from "../../../../../configs/schema";
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export async function GET(req: Request) {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const decoded = verifyToken(token) as { email: string }

        const users = await db.select().from(usersTable).where(eq(usersTable.email, decoded.email)).limit(1)

        const user = users[0]

        if (!user) {
            return new Response("User not found", { status: 404 })
        }

        return Response.json({
            user: {
                email: user.email,
                userName: user.userName,
                createdAt: user.createdAt,
                avatarUrl: user?.avatarUrl
            },
        })
    } catch (err: any) {
        return new Response("Invalid token", { status: 401 })
    }
}  