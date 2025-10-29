// src/app/api/save-practice-task/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {db} from "../../../../configs/db";
import {and, eq} from "drizzle-orm";
import {coursesTable, enrolledCourseTable} from "../../../../configs/schema";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    const { courseId, groupIndex, chapterIndex, practice, userAnswer } = await req.json();

    const user =  await getServerUser()
    const userEmail = user?.email

    const enrolledCourses = await db.select().from(enrolledCourseTable)
        .where(and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail)))
        .execute();
    console.log(enrolledCourses)

    if (!enrolledCourses || enrolledCourses.length === 0)
        return NextResponse.json({ error: "Запись пользователя не найдена" }, { status: 404 });

    const enrolledCourse = enrolledCourses[0];
    const key = `${groupIndex}-${chapterIndex}`;
    const currentPractice = enrolledCourse.practiceTasks || {};

    // Обновляем
    const updatedPractice = {
        ...currentPractice,
        [key]: {
            practice: practice || currentPractice[key]?.practice,
            answer: userAnswer || currentPractice[key]?.answer
        }
    };

    await db.update(enrolledCourseTable)
        .set({ practiceTasks: updatedPractice })
        .where(eq(enrolledCourseTable.id, enrolledCourse.id));

    return NextResponse.json({ success: true });
}


export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const groupIndex = parseInt(url.searchParams.get("groupIndex") || "0");
    const chapterIndex = parseInt(url.searchParams.get("chapterIndex") || "0");

    const user = await getServerUser();
    const userEmail = user?.email;

    const enrolledCourses = await db.select().from(enrolledCourseTable)
        .where(and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail)))
        .execute();

    if (!enrolledCourses || enrolledCourses.length === 0)
        return NextResponse.json({ error: "Запись пользователя не найдена" }, { status: 404 });

    const enrolledCourse = enrolledCourses[0];
    const key = `${groupIndex}-${chapterIndex}`;
    const practiceData = enrolledCourse.practiceTasks?.[key] || null;

    return NextResponse.json({ practice: practiceData?.practice, answer: practiceData?.answer });
}