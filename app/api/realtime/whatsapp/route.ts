import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {whatsappChannel} from "@/inngest/channels/whatsapp";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: whatsappChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
