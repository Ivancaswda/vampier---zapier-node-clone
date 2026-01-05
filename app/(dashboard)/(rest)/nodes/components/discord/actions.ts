import {getSubscriptionToken} from "@inngest/realtime";
import {httpRequestChannel} from "@/inngest/channels/http-request";
import {inngest} from "@/inngest/client";
import {geminiChannel} from "@/inngest/channels/gemini";
import {discordChannel} from "@/inngest/channels/discord";

export async function fetchDiscordRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: discordChannel(),
        topics: ['status']
    })
    return token!
}