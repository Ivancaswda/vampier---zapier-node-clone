import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";

import getServerUser from "@/lib/auth-server";
import {credentialTable, executionTable} from "@/configs/schema";
import {desc, eq} from "drizzle-orm";
export async function GET(req: NextRequest) {


    const user = await getServerUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.select().from(executionTable)
        .where(eq(executionTable.createdBy, user?.email))
        .orderBy(desc(executionTable.startedAt));





    return NextResponse.json({
        executions:result
    })
}