import { NextResponse } from "next/server";

import { userBadgesTable, badgesTable, enrolledCourseTable } from "../../../../configs/schema";
import { eq } from "drizzle-orm";
import { awardBadge } from "@/lib/award-badge";
import {db} from "../../../../configs/db";
import getServerUser from "@/lib/auth-server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const user = await getServerUser()
    const email  = user?.email
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    const badges = await db
        .select({
            id: badgesTable.id,
            title: badgesTable.title,
            description: badgesTable.description,
            iconUrl: badgesTable.iconUrl,
        })
        .from(userBadgesTable)
        .innerJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
        .where(eq(userBadgesTable.userEmail, email));

    return NextResponse.json(badges);
}

export async function POST(req: Request) {
    const user = await getServerUser()
    const email = user?.email
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    const enrolled = await db
        .select()
        .from(enrolledCourseTable)
        .where(eq(enrolledCourseTable.userEmail, email));

    const awardedBadges: any[] = [];

    const badgeRules: { code: string; condition: () => boolean }[] = [
        { code: "3_courses", condition: () => enrolled.length >= 3 },
        { code: "5_courses", condition: () => enrolled.length >= 5 },
        { code: "3_homeworks", condition: () => enrolled.some(c => c.homeworks && Object.keys(c.homeworks).length >= 3) },
        { code: "3_practice", condition: () => enrolled.some(c => c.practiceTasks && Object.keys(c.practiceTasks).length >= 3) },
    ];

    for (const rule of badgeRules) {
        if (rule.condition()) {
            await awardBadge(email, rule.code);

            const badge = await db.select().from(badgesTable).where(eq(badgesTable.code, rule.code)).limit(1);
            if (badge[0]) awardedBadges.push(badge[0]);
        }
    }

    return NextResponse.json({ success: true, awardedBadges });
}

