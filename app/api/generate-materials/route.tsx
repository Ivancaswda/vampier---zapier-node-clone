import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../configs/db";
import {coursesTable, enrolledCourseTable} from "../../../../configs/schema";
import { eq, and } from "drizzle-orm";
import getServerUser from "@/lib/auth-server";
import { generatePdf } from "@/lib/downloadPDF";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
                and(
                    eq(enrolledCourseTable.cid, courseId),
                    eq(enrolledCourseTable.userEmail, userEmail)
                )
            )
            .execute();
        if (!enrolled || enrolled.length === 0) {
            return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
        }
        const course = enrolled[0];
        const courseRow = await db
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.cid, courseId))
            .execute();

        if (!courseRow || courseRow.length === 0) {
            return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
        }


        const courseData = courseRow[0].courseJson?.course; // твой JSON



        const chapter = courseData.chapters?.[groupIndex] || courseData.chapters[groupIndex].topics[chapterIndex]; // если у тебя 1 уровень групп = главы


        console.log('chapter===')
        console.log(chapter)


        if (!chapter) {
            return NextResponse.json({ error: "Глава не найдена" }, { status: 404 });
        }
        const chapterName = chapter.chapterName || "Без названия";
        const topics = chapter.topics?.map((t: any) => t).join(', ')
            || chapter.topic
            || "Общие темы по главе";
        const text = chapter.topics?.map((t: any) => t).join("\n")
            || chapter.content
            || `Объясни основные концепции по теме "${chapterName}"`;
        console.log('chapterName===')
        console.log(chapterName)
        console.log('topics===')
        console.log(topics)
        console.log('text===')
        console.log(text)



        const prompt = `
Ты — преподаватель. Сгенерируй раздаточные материалы для главы курса.
Глава: ${chapterName}
Темы: ${topics}
Текст: ${text}

Формат ответа (JSON):
{
  "summary": ["краткий конспект (5–7 пунктов)"],
  "checklist": ["список того, что нужно повторить"],
  "flashcards": [
    {"q": "вопрос по содержанию главы", "a": "короткий ответ"}
  ]
}
`;




        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);

        let raw = result.response.text().replace(/```json|```/g, "").trim();
        console.log('raw===')
        console.log(raw)
        if (!raw.includes("{")) {
            return NextResponse.json(
                { error: "Модель не смогла сгенерировать материалы", raw },
                { status: 400 }
            );
        }
        let materials;
        try {

            materials = JSON.parse(raw);
        } catch (e1) {
            console.warn("Сырой ответ не является JSON. Попробуем вырезать фигурные скобки...");
            const firstBrace = raw.indexOf("{");
            const lastBrace = raw.lastIndexOf("}");

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonCandidate = raw.slice(firstBrace, lastBrace + 1);
                try {
                    materials = JSON.parse(jsonCandidate);
                } catch (e2) {
                    console.error("Ошибка парсинга JSON:", e2);
                    console.error("Сырой JSON-кандидат:", jsonCandidate);


                    const safeRaw = jsonCandidate
                        .replace(/[\u201C\u201D]/g, '"')
                        .replace(/[\u2018\u2019]/g, "'")
                        .replace(/\n/g, "\\n");

                    try {
                        materials = JSON.parse(safeRaw);
                    } catch (e3) {
                        console.error("Не удалось распарсить даже после очистки");
                        throw e3;
                    }
                }
            } else {
                console.error("Модель вернула что-то без JSON:");
                console.error(raw);
                throw new Error("Ответ модели не содержит JSON-объекта");
            }
        }

        const pdfBuffer = await generatePdf(materials);

        await db
            .update(enrolledCourseTable)
            .set({
                materials: {
                    ...(course.materials || {}), // чтобы не затирать старое
                    [`${groupIndex}-${chapterIndex}`]: {
                        ...materials,
                        pdf: pdfBuffer.toString("base64"),
                    }
                }
            })
            .where(
                and(
                    eq(enrolledCourseTable.cid, courseId),
                    eq(enrolledCourseTable.userEmail, userEmail)
                )
            );

        return NextResponse.json({
            materials,
            pdf: pdfBuffer.toString("base64"),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Ошибка генерации материалов" }, { status: 500 });
    }
}
