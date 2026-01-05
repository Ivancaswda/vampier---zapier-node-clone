import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {openaiChannel} from '@/inngest/channels/openai'
export async function fetchOpenaiRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: openaiChannel(),
        topics: ['status']
    })
    return token!
}