import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";

import {openaiChannel} from "@/inngest/channels/openai";

export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: openaiChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
