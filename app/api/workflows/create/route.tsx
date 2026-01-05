import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";
import {v4 as uuidv4} from 'uuid'
import getServerUser from "@/lib/auth-server";
import {workflowsTable} from "@/configs/schema";
import {inngest} from "@/inngest/client";
import axios from "axios";

/*
export async function getRuns(runId: string) {
    const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
        headers: { Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}` }
    });
    return result.data;
}
export async function POST(req: NextRequest) {

    const {name} = await req.json()
    const user = await getServerUser()

    const resultIds = await inngest.send({
        name: 'text/hello.world',
        data: { email: user?.email, name:name}
    });
    const runId = resultIds?.ids[0];
    let runStatus;


    while (true) {
        runStatus = await getRuns(runId);
        if (runStatus?.data[0]?.status === 'Completed') break;
        await new Promise(resolve => setTimeout(resolve, 500));
    }


    return NextResponse.json({
       success: true
    })
}
*/
import { and, eq, count } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        const user = await getServerUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }


        const [{ value: total }] = await db
            .select({ value: count() })
            .from(workflowsTable)
            .where(eq(workflowsTable.createdBy, user.email));

        if (!user.isPro && total >= 3) {
            return NextResponse.json(
                {
                    error: "LIMIT_REACHED",
                    message: "На бесплатном тарифе можно создать только 3 воркфлоу"
                },
                { status: 409 }
            );
        }

        const workflowId = uuidv4();

        await db.insert(workflowsTable).values({
            name,
            createdBy: user.email,
            workflowId,
        });

        return NextResponse.json({ success: true, workflowId });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}


