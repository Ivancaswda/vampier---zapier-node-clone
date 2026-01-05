// app/api/workflows/getOne/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import getServerUser from "@/lib/auth-server";
import { credentialTable } from "@/configs/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const credentialId = url.searchParams.get("id");

    const user = await getServerUser();
    if (!user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!credentialId) {
        return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
    }

    const credential = await db
        .select()
        .from(credentialTable)
        .where(
            and(
                eq(credentialTable.credentialId, credentialId),
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