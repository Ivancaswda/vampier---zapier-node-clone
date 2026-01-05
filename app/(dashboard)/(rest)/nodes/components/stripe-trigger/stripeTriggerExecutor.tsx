import React from 'react'
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";
import {stripeTriggerChannel} from "@/inngest/channels/stripe-trigger";

const StripeTriggerExecutor = async ({nodeId, context, step, publish}) => {
    // publish loading state for manual trigger

    await publish(
        stripeTriggerChannel().status({
            nodeId: nodeId,
            status: 'loading'
        })
    )
    const result = await step.run('stripe_trigger', async () => context)

    await publish(
        stripeTriggerChannel().status({
            nodeId: nodeId,
            status: 'success'
        })
    )

    return result!
}
export default StripeTriggerExecutor
