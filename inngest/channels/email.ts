
import { channel, topic } from "@inngest/realtime";

export const emailChannel = channel("email-execution").addTopic(
    topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>()
);
