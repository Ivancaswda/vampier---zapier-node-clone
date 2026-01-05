import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {discordChannel} from "@/inngest/channels/discord";
import {telegramChannel} from "@/inngest/channels/telegram";
import {whatsappChannel} from "@/inngest/channels/whatsapp";

export async function fetchWhatsappRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: whatsappChannel(),
        topics: ['status']
    })
    return token!
}