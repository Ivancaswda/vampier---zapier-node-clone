import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {discordChannel} from "@/inngest/channels/discord";
import {telegramChannel} from "@/inngest/channels/telegram";
import {vkChannel} from "@/inngest/channels/vk";

export async function fetchVkRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: vkChannel(),
        topics: ['status']
    })
    return token!
}