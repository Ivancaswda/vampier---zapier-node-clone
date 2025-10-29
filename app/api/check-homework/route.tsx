
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { userAnswer, correctAnswer, type } = await req.json();

        let verdict = false;
        if (type === "boolean" || type === "short_answer") {
            // проверка через AI на семантическое совпадение
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const checkPrompt = `
      Сравни ответ студента: "${userAnswer}" и правильный ответ: "${correctAnswer}".
      Верни "true", если ответ правильный (по смыслу), иначе "false".
      `;
            const result = await model.generateContent(checkPrompt);
            verdict = result.response.text().toLowerCase().includes("true");
        } else if (type === "code") {

            verdict = userAnswer.trim() === correctAnswer.trim();
        }

        return NextResponse.json({ correct: verdict });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Ошибка проверки" }, { status: 500 });
    }
}
