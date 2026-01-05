import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";

import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {workflowExecutionChannel} from "@/inngest/channels/workflow";

export async function fetchWorkflowRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: workflowExecutionChannel(),
        topics: ['status']
    })
    return token;
}