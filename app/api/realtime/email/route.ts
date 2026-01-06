import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {emailChannel} from "@/inngest/channels/email";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: emailChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
