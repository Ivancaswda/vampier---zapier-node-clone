import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {anthropicChannel} from '@/inngest/channels/anthropic'
export async function fetchAnthropicRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: anthropicChannel(),
        topics: ['status']
    })
    return token!
}