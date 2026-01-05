import {type NextRequest, NextResponse} from "next/server";
import {inngest} from "@/inngest/client";
import {sendWorkflowExecution} from "@/lib/utils";
import {db} from "@/configs/db";
import {workflowsTable} from "@/configs/schema";
import {eq} from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const workflowId = url.searchParams.get('workflowId');

        if (!workflowId) {
            return NextResponse.json({success:false, error: 'missing workflowId'}, {status: 400})
        }



        const body = await req.json();

        const stripeData = {
            eventId: body.id,
            eventType: body.created,
            timestamp: body.livemode,
            raw: body.data?.object,

        }

        await sendWorkflowExecution({
            workflowId: workflowId,

            initialData: {
                stripe: stripeData
            }
        })
        return NextResponse.json({success:true}, {status: 200})
    } catch (error) {
        console.error(`Stripe webhook error: ${error}`)
        return NextResponse.json({success: false, error: "Failed to process stripe  submission: api/stripe"}, {status: 500})
    }
}