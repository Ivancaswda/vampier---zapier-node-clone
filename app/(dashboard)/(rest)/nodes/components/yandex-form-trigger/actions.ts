import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";

import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {yandexFormTriggerChannel} from "@/inngest/channels/yandex";

export async function fetchYandexTriggerRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: yandexFormTriggerChannel(),
        topics: ['status']
    })
    return token!
}