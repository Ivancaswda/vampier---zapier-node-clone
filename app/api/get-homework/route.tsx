import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../configs/db";
import { enrolledCourseTable } from "../../../../configs/schema";
import { eq, and } from "drizzle-orm";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const { courseId, groupIndex, chapterIndex } = await req.json();
        const user = await getServerUser()
        const userEmail = user?.email
        const enrolled = await db
            .select()
            .from(enrolledCourseTable)
            .where(
                and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail))
            )
            .execute();

        if (!enrolled || enrolled.length === 0) {
            return NextResponse.json({ error: "Студент не найден" }, { status: 404 });
        }

        const record = enrolled[0];
        const key = `${groupIndex}-${chapterIndex}`;
        const savedHomework = record.homeworks?.[key] || { answers: {} };

        return NextResponse.json(savedHomework);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Ошибка загрузки ДЗ" }, { status: 500 });
    }
}
