import {NextRequest, NextResponse} from "next/server";
import {db} from "@/configs/db";
import {v4 as uuidv4} from 'uuid'
import getServerUser from "@/lib/auth-server";
import {credentialTable, workflowsTable} from "@/configs/schema";
import {inngest} from "@/inngest/client";
import axios from "axios";
import {encrypt} from "@/lib/encryption";

export async function POST(req: NextRequest) {
    try {
        const { name, type, value} = await req.json();
        const user = await getServerUser();
        const credentialId = uuidv4()
        await db.insert(credentialTable).values({
            name,
            createdBy: user?.email,
            type: type,
            value: encrypt(value),
            credentialId:  credentialId,

        })



        return NextResponse.json({ success: true, credentialId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
