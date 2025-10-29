import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../configs/db";
import { enrolledCourseTable } from "../../../../configs/schema";
import { eq, and } from "drizzle-orm";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const { courseId, groupIndex, chapterIndex } = await req.json();
        const user = await getServerUser();
        const userEmail = user?.email;

        if (!userEmail) {
            return NextResponse.json({ error: "Не найден пользователь" }, { status: 401 });
        }

        const enrolled = await db
            .select()
            .from(enrolledCourseTable)
            .where(
                and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail))
            )
            .execute();

        if (!enrolled || enrolled.length === 0) {
            return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
        }

        const record = enrolled[0];
        const key = `${groupIndex}-${chapterIndex}`;
        const savedMaterials = record.materials?.[key] || null;

        return NextResponse.json(savedMaterials);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Ошибка загрузки материалов" }, { status: 500 });
    }
}
