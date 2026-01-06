import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: manualTriggerChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
