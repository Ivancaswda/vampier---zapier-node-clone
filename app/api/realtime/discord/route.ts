import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {discordChannel} from "@/inngest/channels/discord";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: discordChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
