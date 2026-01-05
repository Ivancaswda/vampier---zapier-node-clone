import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/configs/db";
import { workflowsTable } from "@/configs/schema";
import getServerUser from "@/lib/auth-server";

export async function PATCH(req: NextRequest) {
    try {
        const { id, newName } = await req.json();
        const user = await getServerUser();

        if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id || !newName?.trim()) {
            return NextResponse.json({ error: "Missing ID or new name" }, { status: 400 });
        }

        const updated = await db
            .update(workflowsTable)
            .set({ name: newName })
            .where(and(eq(workflowsTable.id, id), eq(workflowsTable.createdBy, user.email)))
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
