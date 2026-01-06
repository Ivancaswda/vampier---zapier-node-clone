import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {slackChannel} from "@/inngest/channels/slack";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: slackChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
