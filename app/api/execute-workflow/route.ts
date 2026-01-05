import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { workflowsTable, nodesTable, connectionsTable } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import getServerUser from "@/lib/auth-server";
import { inngest } from "@/inngest/client";
import axios from "axios";

export async function getRuns(runId: string) {
    const result = await axios.get(
        `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`,
        {
            headers: { Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}` }
        }
    );
    return result.data;
}

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();
        const user = await getServerUser();

        if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: "Missing workflow ID" }, { status: 400 });
        }

        // 1️⃣ загрузить workflow
        const workflowResult = await db
            .select()
            .from(workflowsTable)
            .where(
                and(
                    eq(workflowsTable.workflowId, id),
                    eq(workflowsTable.createdBy, user.email)
                )
            );

        if (!workflowResult.length) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const workflow = workflowResult[0];

        // 2️⃣ загрузить nodes
        const nodes = await db
            .select()
            .from(nodesTable)
            .where(eq(nodesTable.workflowId, id));

        // 3️⃣ загрузить connections
        const connections = await db
            .select()
            .from(connectionsTable)
            .where(eq(connectionsTable.workflowId, id));

        // 4️⃣ собрать workflow
        const fullWorkflow = {
            ...workflow,
            nodes: nodes.map(n => ({
                id: n.nodeId,
                type: n.type,
                position: n.position,
                data: n.data
            })),
            connections: connections.map(c => ({
                fromNodeId: c.fromNodeId,
                toNodeId: c.toNodeId,
                fromOutput: c.fromOutput,
                toInput: c.toInput
            }))
        };
        console.log('fullWorkflow===')
        console.log(fullWorkflow)


        const resultIds = await inngest.send({
            name: "workflow/execute.workflow",
            data: { workflowId: id, createdBy: user?.email, workflowName: workflow?.name }
        });

        const runId = resultIds?.ids[0];
        let runStatus;

        while (true) {
            runStatus = await getRuns(runId);
            if (runStatus?.data[0]?.status === "Completed" || runStatus?.data[0]?.status === "Failed" || runStatus?.data[0]?.status === "Cancelled") break;
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return NextResponse.json({ success: true });
    }catch (error) {
        return  NextResponse.json({success:false, error: error}, {status: 500})
    }
}
