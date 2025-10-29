
import { userBadgesTable, badgesTable } from "../../configs/schema";
import { eq, and } from "drizzle-orm";
import {toast} from "sonner";
import {db} from "../../configs/db";

export async function awardBadge(userEmail: string, badgeCode: string) {

    const badge = await db.select().from(badgesTable).where(eq(badgesTable.code, badgeCode)).limit(1);

    if (!badge[0]) throw new Error("Badge not found");


    const already = await db.select()
        .from(userBadgesTable)
        .where(and(eq(userBadgesTable.userEmail, userEmail), eq(userBadgesTable.badgeId, badge[0].id)));

    if (already.length > 0) return;


    await db.insert(userBadgesTable).values({
        userEmail,
        badgeId: badge[0].id,
    });
}
