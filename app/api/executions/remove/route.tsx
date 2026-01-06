import {NextRequest, NextResponse} from "next/server";
import getServerUser from "@/lib/auth-server";
import {db} from "@/configs/db";
import {credentialTable, executionTable} from "@/configs/schema";
import {eq, and} from 'drizzle-orm'
export async function DELETE(req: NextRequest) {

    try {


        const {executionId: id} = await req.json()

        const user = await getServerUser()

        if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
        }
        const deleted = await db
            .delete(executionTable)
            .where(and(eq(executionTable.executionId, id), eq(executionTable.createdBy, user.email)))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({error: "execution not found or no access"}, {status: 404});
        }
        return NextResponse.json({ success: true, deleted: deleted[0] });
    } catch (error) {
        console.error("Delete credential error:", error);
        return NextResponse.json({error: "Server error during delete"}, {status: 500});
    }

}