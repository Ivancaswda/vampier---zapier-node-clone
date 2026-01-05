import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";

export async function fetchManualTriggerRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: manualTriggerChannel(),
        topics: ['status']
    })
    return token!
}