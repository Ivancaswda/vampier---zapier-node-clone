import { NextResponse } from "next/server";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import {anthropicChannel} from "@/inngest/channels/anthropic";
import {yandexFormTriggerChannel} from "@/inngest/channels/yandex";


export async function GET() {
    const token = await getSubscriptionToken(inngest, {
        channel: yandexFormTriggerChannel(),
        topics: ["status"],
    });

    return NextResponse.json({ token });
}
