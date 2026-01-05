import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    return NextResponse.json({ message: "LemonSqueezy webhook endpoint. Use POST." });
}

export async function POST(req: NextRequest) {
    let event;
    try {
        event = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
        const email = event?.data?.attributes?.user_email;
        const status = event?.data?.attributes?.status;
        const eventName = event?.meta?.event_name;

        if (!email || !eventName) {
            return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
        }


        if (
            (eventName === "order_created" || eventName === "order_paid") &&
            status === "paid"
        ) {
            await db.update(usersTable)
                .set({ isPro: true })
                .where(eq(usersTable.email, email))
                .execute();
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
