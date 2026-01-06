import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: googleFormTriggerChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
