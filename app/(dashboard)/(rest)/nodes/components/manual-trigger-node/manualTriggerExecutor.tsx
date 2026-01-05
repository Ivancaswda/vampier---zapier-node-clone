import React from 'react'
import {manualTriggerChannel} from "@/inngest/channels/manual-trigger";

const ManualTriggerExecutor = async ({nodeId, context, step, publish}) => {
    // publish loading state for manual trigger

    await publish(
        manualTriggerChannel().status({
            nodeId: nodeId,
            status: 'loading'
        })
    )
    const result = await step.run('manual_trigger', async () => context)

    await publish(
        manualTriggerChannel().status({
            nodeId: nodeId,
            status: 'success'
        })
    )

    return result!
}
export default ManualTriggerExecutor
