import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";

import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";

export async function fetchGoogleTriggerRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: googleFormTriggerChannel(),
        topics: ['status']
    })
    return token!
}