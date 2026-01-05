import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { workflowsTable, nodesTable, connectionsTable } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { workflowId, name, nodes, connections } = await req.json();

        if (!workflowId || !nodes || !connections) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const now = new Date().toISOString();


        await db
            .update(workflowsTable)
            .set({
                name,
                updatedAt: now,
            })
            .where(
                and(
                    eq(workflowsTable.workflowId, workflowId),
                    eq(workflowsTable.createdBy, user.email)
                )
            );


        await db.delete(nodesTable).where(eq(nodesTable.workflowId, workflowId));
        await db.delete(connectionsTable).where(eq(connectionsTable.workflowId, workflowId));


        await db.insert(nodesTable).values(
            nodes.map((n: any) => ({
                workflowId,
                nodeId: n.id,
                type: n.type,
                position: n.position,
                data: n.data,
                createdAt: now,
                updatedAt: now
            }))
        );


        await db.insert(connectionsTable).values(
            connections.map((c: any) => ({
                workflowId,
                fromNodeId: c.source,
                toNodeId: c.target,
                fromOutput: c.sourceHandle,
                toInput: c.targetHandle
            }))
        );

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
