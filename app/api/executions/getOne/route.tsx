import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import getServerUser from "@/lib/auth-server";
import { executionTable } from "@/configs/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const executionId = searchParams.get("id");

    // 🔐 Auth
    const user = await getServerUser();
    if (!user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ❗ Validation
    if (!executionId) {
        return NextResponse.json(
            { error: "Missing execution ID" },
            { status: 400 }
        );
    }


    const execution = await db
        .select()
        .from(executionTable)
        .where(
            and(
                eq(executionTable.executionId, executionId),
                eq(executionTable.createdBy, user.email)
            )
        )
        .then(r => r[0]);

    if (!execution) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }


    return NextResponse.json({ execution });
}
