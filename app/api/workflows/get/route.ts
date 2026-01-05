import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";

import getServerUser from "@/lib/auth-server";
import {workflowsTable} from "@/configs/schema";
import {eq} from "drizzle-orm";
export async function GET(req: NextRequest) {


    const user = await getServerUser()

    const result = await db.select().from(workflowsTable)
        .where(eq(workflowsTable.createdBy, user?.email))





    return NextResponse.json({
       workflows:result
    })
}