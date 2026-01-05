import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";

import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {stripeTriggerChannel} from "@/inngest/channels/stripe-trigger";

export async function fetchStripeRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: stripeTriggerChannel(),
        topics: ['status']
    })
    return token!
}