import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";

import getServerUser from "@/lib/auth-server";
import {workflowsTable} from "@/configs/schema";
import {desc, eq} from "drizzle-orm";
export async function GET(req: NextRequest) {


    const user = await getServerUser()

    // @ts-ignore
    const workflows = await db
        .select()
        .from(workflowsTable)
        .where(eq(workflowsTable.createdBy, user?.email))
        .orderBy(desc(workflowsTable.createdAt));





    return NextResponse.json({
       workflows:workflows
    })
}