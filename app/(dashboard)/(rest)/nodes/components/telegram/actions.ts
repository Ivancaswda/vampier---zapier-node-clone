import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {discordChannel} from "@/inngest/channels/discord";
import {telegramChannel} from "@/inngest/channels/telegram";

export async function fetchTelegramRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: telegramChannel(),
        topics: ['status']
    })
    return token!
}