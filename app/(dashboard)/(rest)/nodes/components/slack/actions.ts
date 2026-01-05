import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {slackChannel} from "@/inngest/channels/slack";

export async function fetchSlackRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: slackChannel(),
        topics: ['status']
    })
    return token!
}