// src/app/api/generate-save-practice-task/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../configs/db";
import { coursesTable } from "../../../../configs/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { courseId, groupIndex, chapterIndex } = await req.json();

        // 1. Достаём курс из БД
        const courses = await db
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.cid, courseId))
            .execute();

        if (!courses || courses.length === 0) {
            return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
        }

        const course = courses[0].courseJson?.course;





        const chapter = course.chapters?.[groupIndex] || course.chapters[groupIndex].topics[chapterIndex];


        const prompt = `
Ты преподаватель. Сгенерируй практическое задание по теме "${chapter.chapterName}" 
для языка ${course.name}. 

Формат JSON:
{
  "question": "Напишите функцию reverseString, которая переворачивает строку",
  "language": "${course.name}",
  "starterCode": "function reverseString(str: string): string {\n  // ваш код\n}",
  "tests": [
    { "input": ["hello"], "expected": "olleh" },
    { "input": ["typescript"], "expected": "tpircsetypT" }
  ],
  "timeLimit": 30 (не меньше 30)
}

Важно:
- Используй именно ${course.name} как язык программирования.
- Верни только JSON, без Markdown и текста вокруг.
    `;


        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);

        let rawResp = result.response.text().trim();
        rawResp = rawResp.replace(/```json/g, "").replace(/```/g, "").trim();

        const firstBrace = rawResp.indexOf("{");
        const lastBrace = rawResp.lastIndexOf("}");
        const jsonString = rawResp.substring(firstBrace, lastBrace + 1);

        const practice = JSON.parse(jsonString);




        return NextResponse.json(practice);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Ошибка генерации практики" }, { status: 500 });
    }
}
