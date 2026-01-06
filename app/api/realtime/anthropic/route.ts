import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: anthropicChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
