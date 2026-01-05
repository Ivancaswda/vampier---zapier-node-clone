import {type NextRequest, NextResponse} from "next/server";
import {inngest} from "@/inngest/client";
import {sendWorkflowExecution} from "@/lib/utils";
import {db} from "@/configs/db";
import {workflowsTable} from "@/configs/schema";
import {and, eq} from "drizzle-orm";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const workflowId = url.searchParams.get('workflowId');

        if (!workflowId) {
            return NextResponse.json({success:false, error: 'missing workflowId'}, {status: 400})
        }



        const workflow = await db
            .select()
            .from(workflowsTable)
            .where(
                    eq(workflowsTable.workflowId, workflowId),
            )
            .then(r => r[0]);

        if (!workflow) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await req.json();

        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responseId: body.responseId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: body.responses,
            raw: body
        }

        await sendWorkflowExecution({
            workflowId: workflowId,
            createdBy: workflow?.createdBy,
            workflowName: workflow.name,
            initialData: {
                googleForm: formData
            }
        })
    } catch (error) {
        console.error(`Google form webhook error: ${error}`)
        return NextResponse.json({success: false, error: "Failed to process google form submission: api/google-form"}, {status: 500})
    }
}