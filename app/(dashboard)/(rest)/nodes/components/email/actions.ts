// app/.../nodes/components/email/actions.ts
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest } from "@/inngest/client";
import { emailChannel } from "@/inngest/channels/email";

export async function fetchEmailRealtimeToken() {
    const token = await getSubscriptionToken(inngest, {
        channel: emailChannel(),
        topics: ["status"],
    });

    return token!;
}
