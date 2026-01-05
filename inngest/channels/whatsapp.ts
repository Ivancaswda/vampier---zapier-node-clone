import {channel, topic} from "@inngest/realtime";

export const whatsappChannel = channel("telegram-execution").addTopic(topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
)