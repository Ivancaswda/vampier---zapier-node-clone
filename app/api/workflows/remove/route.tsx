import {NextRequest, NextResponse} from "next/server";
import getServerUser from "@/lib/auth-server";
import {db} from "@/configs/db";
import {workflowsTable} from "@/configs/schema";
import {eq, and} from 'drizzle-orm'
export async function DELETE(req: NextRequest) {

    try {

        const url = new URL(req.url);
        const id = url.searchParams.get("id");





        if (!id) {
            return NextResponse.json({ error: "Missing workflow ID" }, { status: 400 });
        }
        const deleted = await db
            .delete(workflowsTable)
            .where(eq(workflowsTable.workflowId, id))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({error: "Workflow not found or no access"}, {status: 404});
        }
        return NextResponse.json({ success: true, deleted: deleted[0] });
    } catch (error) {
        console.error("Delete workflow error:", error);
        return NextResponse.json({error: "Server error during delete"}, {status: 500});
    }

}