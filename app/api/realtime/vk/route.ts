import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {vkChannel} from "@/inngest/channels/vk";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: vkChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
