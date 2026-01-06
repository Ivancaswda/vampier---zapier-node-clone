import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {httpRequestChannel} from "@/inngest/channels/http-request";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: httpRequestChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
