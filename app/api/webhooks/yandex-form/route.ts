// app/api/webhooks/yandex-form/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/lib/utils";
import getServerUser from "@/lib/auth-server";
import {db} from "@/configs/db";
import {workflowsTable} from "@/configs/schema";
import {and, eq} from "drizzle-orm";

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
        return NextResponse.json({ error: "missing workflowId" }, { status: 400 });
    }

    const workflow = await db
        .select()
        .from(workflowsTable)
        .where(eq(workflowsTable.workflowId, workflowId))
        .then(r => r[0]);

    if (!workflow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await req.text();
    let body: any;

    try {
        body = JSON.parse(raw);
    } catch {
        body = { raw };
    }



    const formData = {
        body: body,
        raw: raw
    };

    await sendWorkflowExecution({
        workflowId: workflowId,
        createdBy: workflow?.createdBy,
        workflowName: workflow.name,
        initialData: {
            yandexForm: formData
        }
    });

    return NextResponse.json({ success: true });
}

