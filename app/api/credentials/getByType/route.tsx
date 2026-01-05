// app/api/workflows/getOne/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import getServerUser from "@/lib/auth-server";
import { credentialTable } from "@/configs/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const user = await getServerUser();
    if (!user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!type) {
        return NextResponse.json({ error: "Missing type of credential" }, { status: 400 });
    }

    const credential = await db
        .select()
        .from(credentialTable)
        .where(
            and(
                eq(credentialTable.type, type),
                eq(credentialTable.createdBy, user.email)
            )
        )
        .then(r => r[0]);

    if (!credential) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }



    return NextResponse.json({
        credential
    });
}