import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";

export async function fetchHttpRequestRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: httpRequestChannel(),
        topics: ['status']
    })
    return token!
}