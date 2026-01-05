import {channel, topic} from "@inngest/realtime";

export const yandexFormTriggerChannel = channel("yandex-form-trigger-execution").addTopic(topic("status").type<{
        nodeId: string;
        status: "loading" | "success" | "error";
    }>(),
)