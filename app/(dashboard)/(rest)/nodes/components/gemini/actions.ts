import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";

export async function fetchGeminiRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: geminiChannel(),
        topics: ['status']
    })
    return token!
}