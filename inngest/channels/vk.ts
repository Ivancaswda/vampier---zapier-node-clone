import {channel, topic} from "@inngest/realtime";

export const vkChannel = channel("vk-execution").addTopic(topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
)