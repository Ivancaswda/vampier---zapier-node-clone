// app/api/workflows/getOne/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import getServerUser from "@/lib/auth-server";
import { workflowsTable, nodesTable, connectionsTable } from "@/configs/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const workflowId = url.searchParams.get("id");

    const user = await getServerUser();
    if (!user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!workflowId) {
        return NextResponse.json({ error: "Missing workflow ID" }, { status: 400 });
    }

    const workflow = await db
        .select()
        .from(workflowsTable)
        .where(
            and(
                eq(workflowsTable.workflowId, workflowId),
                eq(workflowsTable.createdBy, user.email)
            )
        )
        .then(r => r[0]);

    if (!workflow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nodes = await db
        .select()
        .from(nodesTable)
        .where(eq(nodesTable.workflowId, workflowId));

    const connections = await db
        .select()
        .from(connectionsTable)
        .where(eq(connectionsTable.workflowId, workflowId));

    return NextResponse.json({
        workflow: {
            ...workflow,
            nodes: nodes.map(n => ({
                id: n.nodeId,
                type: n.type,
                position: n.position,
                data: n.data,
            })),
            connections: connections.map(c => ({
                id: `${c.fromNodeId}-${c.toNodeId}`,
                source: c.fromNodeId,
                target: c.toNodeId,
                sourceHandle: c.fromOutput,
                targetHandle: c.toInput,
            })),
        },
    });
}