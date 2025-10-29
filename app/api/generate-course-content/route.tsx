import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../configs/db";
import { eq } from "drizzle-orm";
import { coursesTable } from "../../../../configs/schema";
import axios from "axios";

const PROMPT = `
Ты должен отвечать строго в формате JSON. Никакого текста вне JSON.  
Формат ответа:

{
  "chapterName": "<название главы>",
  "topics": [
    {
      "topic": "<название темы>",
      "content": "<html-код>"
    }
  ]
}

Требования:
- Всегда возвращай корректный JSON, без комментариев и без Markdown-блоков.
- Если не можешь придумать контент — всё равно верни JSON, но поставь "content": "<p>Контент не найден</p>".
- Никогда не пиши \`\`\`json или \`\`\` в начале и конце ответа.
user Input:
`;


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { courseJson, courseTitle, courseId } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const promises = courseJson?.chapters?.map(async (chapter: any) => {
            const topicPromises = chapter.topics?.map(async (topic: string) => {
                try {
                    const prompt = PROMPT + JSON.stringify({ chapterName: chapter.chapterName, topic });

                    const result = await model.generateContent(prompt);
                    const rawResp = result.response.text() || "";

                    const jsonResp = safeParseJSON(rawResp);
                    if (!jsonResp) {
                        console.error("⚠️ Некорректный JSON:", rawResp);
                        return { error: `Invalid JSON for topic: ${topic}` };
                    }


                    const youtubeData = await getYoutubeVideos(chapter.chapterName + " " + topic);

                    return {
                        youtubeVideo: youtubeData,
                        courseData: jsonResp,
                    };
                } catch (err) {
                    console.error("❌ Ошибка генерации топика:", topic, err);
                    return { error: `Failed to generate content for topic: ${topic}` };
                }
            });

            return await Promise.all(topicPromises);
        });

        const courseContent = await Promise.all(promises);

        await db
            .update(coursesTable)
            .set({ courseContent })
            .where(eq(coursesTable.cid, courseId));

        return NextResponse.json({
            CourseName: courseTitle,
            CourseContent: courseContent,
        });
    } catch (error) {
        console.error("❌ Error in course generation:", error);
        return NextResponse.json(
            { error: "Failed to generate course content" },
            { status: 500 }
        );
    }
}


function safeParseJSON(str: string) {
    try {
        const cleaned = str
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .replace(/[\u0000-\u001F]+/g, "")
            .trim();

        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export const getYoutubeVideos = async (query: string) => {
    const params = {
        part: "snippet",
        q: query,
        maxResults: 3,
        type: "video",
        key: process.env.YOUTUBE_API_KEY,
    };

    try {
        const resp = await axios.get(YOUTUBE_BASE_URL, { params });
        return resp.data.items.map((item: any) => ({
            videoId: item.id?.videoId,
            title: item.snippet?.title,
        }));
    } catch (error) {
        console.error("❌ Error fetching YouTube videos:", error);
        return [];
    }
};
