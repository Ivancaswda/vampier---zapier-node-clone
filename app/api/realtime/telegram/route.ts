import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {telegramChannel} from "@/inngest/channels/telegram";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: telegramChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
