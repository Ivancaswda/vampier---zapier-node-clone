import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/configs/db";
import { credentialTable } from "@/configs/schema";
import getServerUser from "@/lib/auth-server";
import {encrypt} from "@/lib/encryption";

export async function PATCH(req: NextRequest) {
    try {
        const { id, newName, newType, newValue } = await req.json();
        const user = await getServerUser();

        if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id || !newName?.trim()) {
            return NextResponse.json({ error: "Missing ID or new name" }, { status: 400 });
        }

        const updated = await db
            .update(credentialTable)
            .set({
                name:newName,
                type:newType,
                ...(newValue ? { value: encrypt(newValue) } : {}),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(credentialTable.credentialId, id), // ✅ ВАЖНО
                    eq(credentialTable.createdBy, user.email)
                )
            )
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "Workflow not found or no access" }, { status: 404 });
        }

        return NextResponse.json({ success: true, updated: updated[0] });
    } catch (err) {
        console.error("Update workflow error:", err);
        return NextResponse.json({ error: "Server error during update" }, { status: 500 });
    }
}
