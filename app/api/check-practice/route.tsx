import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { language, code, tests, userAnswer, correctAnswer, type } = await req.json();
        console.log('tests===')
        console.log(tests)
        let verdict = false;
        let results: boolean[] = [];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        if (type === "boolean" || type === "short_answer") {

            const checkPrompt = `
Сравни ответ студента: "${userAnswer}" и правильный ответ: "${correctAnswer}".
Верни "true", если ответ правильный по смыслу, иначе "false".
      `;
            const result = await model.generateContent(checkPrompt);
            verdict = result.response.text().toLowerCase().includes("true");
        } else if (type === "code") {

            const checkPrompt = `
Ты проверяешь код студента на языке ${language}.
Вот код студента:
\`\`\`${language}
${code}
\`\`\`

Прогони его по тестам:
${JSON.stringify(tests, null, 2)}

Формат ответа (строго JSON):
{
  "results": [true, false, ...], 
  "allPass": true | false
}
      `;

            const result = await model.generateContent(checkPrompt);
            const rawResponse = result.response.text()
            const cleaned = rawResponse.replace("```json", "").replace("```", "");
            const data = JSON.parse(cleaned);

            console.log('data====')
            console.log(data)
            results = data.results || [];
            verdict = data.allPass || false;
        }

        return NextResponse.json({ correct: verdict, results });
    } catch (e) {
        console.error("Ошибка в check-practice:", e);
        return NextResponse.json({ error: "Ошибка проверки" }, { status: 500 });
    }
}
