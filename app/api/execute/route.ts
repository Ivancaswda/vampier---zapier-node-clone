import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";

import getServerUser from "@/lib/auth-server";
import {workflowsTable} from "@/configs/schema";
import {inngest} from "@/inngest/client";
import axios from "axios";

export async function getRuns(runId: string) {
    const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
        headers: { Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}` }
    });
    return result.data;
}
export async function POST(req: NextRequest) {




    const resultIds = await inngest.send({
        name: 'text/execute.ai'
    });
    const runId = resultIds?.ids[0];
    let runStatus;


    while (true) {
        runStatus = await getRuns(runId);
        if (runStatus?.data[0]?.status === 'Completed') break;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('runStatus===')
    console.log(runStatus)

    console.log('runId===')
    console.log(runId)

    return NextResponse.json({
        success:true
    })
}