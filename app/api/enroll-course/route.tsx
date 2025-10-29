import {NextRequest, NextResponse} from "next/server";

import getServerUser from "@/lib/auth-server";
import {db} from "../../../../configs/db";
import {coursesTable, enrolledCourseTable} from "../../../../configs/schema";
import {and, desc, eq, ne, sql} from "drizzle-orm";
import {awardBadge} from "@/lib/award-badge";
export async function POST(req: NextRequest) {
    const {courseId} = await req.json()

    const user = await getServerUser()
    const userEmail = user?.email
    const enrollCourses  = await db.select().from(enrolledCourseTable)
        .where(and(eq(enrolledCourseTable.userEmail, user?.email),
            eq(enrolledCourseTable.cid, courseId)
        ))
    const completedCourses = new Set(enrollCourses.map((e) => e.cid)).size;

    if (completedCourses >= 3) {
        await awardBadge(userEmail, "3_courses");
    }

    if (enrollCourses?.length == 0) {
        const result = await db.insert(enrolledCourseTable)
            .values({
                cid: courseId,
                userEmail: user?.email
            }).returning(enrolledCourseTable)

        return NextResponse.json(result)
    }
    return  NextResponse.json({'resp': 'Already Enrolled'})
}

export async function GET(req: NextRequest) {
    const {searchParams}  = new URL(req.url)

    const courseId = searchParams?.get('courseId')
    const user= await getServerUser()
    console.log(user)
    console.log(courseId)

    if (courseId === 0) {
        const result =  await db.select().from(coursesTable)
            .where(sql`${coursesTable.courseContent}::jsonb != '{}' : jsonb`)
        console.log(result)

        return NextResponse.json(result[0])
    }

    if (courseId) {
        const result =  await db.select().from(coursesTable)
            .where(and(eq(enrolledCourseTable.userEmail, user?.email),
                eq(enrolledCourseTable.cid, courseId)
                ))
            .innerJoin(enrolledCourseTable, eq(coursesTable.cid, enrolledCourseTable.cid))
            .orderBy(desc(enrolledCourseTable.id))
        console.log(result)

        return NextResponse.json(result[0])
    } else {
        const result = await db.select().from(coursesTable)
            .where(eq(enrolledCourseTable.userEmail, user?.email))
            .innerJoin(enrolledCourseTable, eq(coursesTable.cid, enrolledCourseTable.cid))
            .orderBy(desc(enrolledCourseTable.id))
        return NextResponse.json(result)
    }

}

export async function PUT(req) {
    const {completedChapter, courseId}  = await req.json()
    const user = await getServerUser()

    const result = await db.update(enrolledCourseTable).set({
        completedChapters: completedChapter
    }).where(and(eq(enrolledCourseTable.cid, courseId),
    eq(enrolledCourseTable.userEmail, user?.email))).returning(enrolledCourseTable)

    return NextResponse.json(result)

}