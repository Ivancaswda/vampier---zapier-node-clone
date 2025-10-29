import {NextRequest, NextResponse} from "next/server";
import {db} from "../../../../configs/db";
import {enrolledCourseTable} from "../../../../configs/schema";
import {and, eq} from "drizzle-orm";
import getServerUser from "@/lib/auth-server";

export async function POST(req: NextRequest) {
    try {
        const {courseId,  groupIndex, chapterIndex, answers} = await req.json()
        const user = await getServerUser()
        const userEmail = user?.email

        const enrolled = await db.select().from(enrolledCourseTable)
            .where(and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail)))
            .execute()

        if (!enrolled || enrolled.length === 0) {
            return NextResponse.json({error: 'course not found'}, {status: 404})
        }
        const record = enrolled[0]
        const currentHomeworks = record.homeworks || {};

        const key = `${groupIndex}-${chapterIndex}`;
        currentHomeworks[key] = { answers };




        await db.update(enrolledCourseTable)
            .set({homeworks: currentHomeworks})
                .where(and(eq(enrolledCourseTable.cid, courseId), eq(enrolledCourseTable.userEmail, userEmail)))


        return NextResponse.json({ success: true, saved: currentHomeworks[key] });
    } catch (error) {
        console.log(error)
    }



}