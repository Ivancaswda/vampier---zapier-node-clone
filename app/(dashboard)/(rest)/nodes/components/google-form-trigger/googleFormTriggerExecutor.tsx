import React from 'react'
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";
import {googleFormTriggerChannel} from "@/inngest/channels/google-form-trigger";

const GoogleFormTriggerExecutor = async ({nodeId, context, step, publish}) => {
    // publish loading state for manual trigger

    await publish(
        googleFormTriggerChannel().status({
            nodeId: nodeId,
            status: 'loading'
        })
    )
    const result = await step.run('google_form_trigger', async () => context)

    await publish(
        googleFormTriggerChannel().status({
            nodeId: nodeId,
            status: 'success'
        })
    )

    return result!
}
export default GoogleFormTriggerExecutor
