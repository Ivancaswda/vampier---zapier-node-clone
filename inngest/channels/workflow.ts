import {channel, topic} from "@inngest/realtime";

export const workflowExecutionChannel = channel("workflow-execution")
    .addTopic(
        topic("status").type<{
            workflowId: string;
            executionId: string;
            status: "running" | "success" | "error";
            message?: string;
        }>()
    );