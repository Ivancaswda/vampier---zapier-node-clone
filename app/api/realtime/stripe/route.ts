import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {stripeTriggerChannel} from "@/inngest/channels/stripe-trigger";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: stripeTriggerChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
