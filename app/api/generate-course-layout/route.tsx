import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../configs/db";
import { coursesTable } from "../../../../configs/schema";
import getServerUser from "@/lib/auth-server";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const PROMPT = `
Сгенерируй учебный курс на основе следующих данных. 
Ответ должен строго соответствовать JSON-схеме:

{
  "course": {
    "name": "string",              // Название курса
    "description": "string",       // Описание курса
    "category": "string",          // Категория
    "level": "string",             // Уровень сложности
    "includeVideo": "boolean",     // Включать ли видео
    "noOfChapters": "number",      // Количество глав
    "chapters": [
      {
        "chapterName": "string",   // Название главы
        "duration": "string",      // Длительность
        "topics": [
          "string"                 // Список тем
        ],
        "imagePrompt": "string"    // Краткое описание для генерации изображения
      }
    ]
  }
}

⚠️ Важно:
- Ответ должен быть только в формате JSON.
- Используй русский язык для описаний и названий.
- Допускается использование английских слов (например, в названиях курсов или тем).

Входные данные пользователя: 
`;


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.json();
        const user = await getServerUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Формируем полный промпт
        const fullPrompt = PROMPT + JSON.stringify(formData);

        // Генерация курса
        const result = await model.generateContent(fullPrompt);

        const rawResp = result.response.text();
        const cleaned = rawResp.replace("```json", "").replace("```", "");
        const jsonResp = JSON.parse(cleaned);
        console.log(jsonResp.course)
        const imagePrompt = jsonResp.course?.chapters[0].imagePrompt;

        console.log('imagePrompt===')
        console.log(imagePrompt)

        const bannerImageUrl = await generateImage(imagePrompt);


        const cid = uuidv4();
        await db.insert(coursesTable).values({
            ...formData,
            courseJson: jsonResp,
            userEmail: user.email,
            cid,
            label: formData?.name,
            bannerImageUrl: bannerImageUrl,
        });

        return NextResponse.json({ courseId: cid });
    } catch (err: any) {
        console.error("❌ Ошибка в generate-course-layout:", err);


        if (err?.status === 503) {
            return NextResponse.json(
                { error: "Модель перегружена. Попробуйте позже." },
                { status: 503 }
            );
        }
        if (err?.response?.status === 429) {
            return NextResponse.json(
                { error: "🚦 Лимит токенов на API-ключ достигнут. Попробуйте позже." },
                { status: 429 }
            );
        }

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

const generateImage = async (imagePrompt: string) => {


    const result = await axios.get(`https://api.unsplash.com/search/photos?query=${imagePrompt}&per_page=1`, {

        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
    });

    if (!result.data?.results?.length) {
        throw new Error("Image not found for prompt: " + imagePrompt);
    }

    return result.data.results[0].urls.regular;
};
