import {channel, topic} from "@inngest/realtime";

export const anthropicChannel = channel("anthropic-execution").addTopic(topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
    )