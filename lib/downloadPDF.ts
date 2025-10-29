import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import * as fontkit from "fontkit";

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach(word => {
        const testLine = currentLine ? currentLine + " " + word : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
}

export async function generatePdf(materials: any) {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync(path.resolve("./public/fonts/Roboto-Regular.ttf"));

    const regularFont = await pdfDoc.embedFont(fontBytes);


    let logoImage: any = null;
    try {
        const logoBytes = fs.readFileSync(path.resolve("./public/logo.png"));
        logoImage = await pdfDoc.embedPng(logoBytes);
    } catch {
        console.warn("⚠️ Лого не найдено, пропускаю отображение.");
    }

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    let y = height - 50;
    const margin = 50;
    const lineHeight = 18;

    const addText = (text: string, size = 12, indent = 0, font = regularFont, color = rgb(0, 0, 0)) => {
        const maxWidth = width - margin * 2 - indent;
        const lines = wrapText(text, maxWidth, font, size);

        lines.forEach(line => {
            if (y < margin + lineHeight) {
                page = pdfDoc.addPage();
                y = height - margin;
            }
            page.drawText(line, {
                x: margin + indent,
                y,
                size,
                font,
                color,
            });
            y -= lineHeight;
        });
    };

    const addDivider = () => {
        y -= 5;
        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });
        y -= 15;
    };


    if (logoImage) {
        const logoDims = logoImage.scale(0.2);
        page.drawImage(logoImage, {
            x: margin,
            y: y - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
        });
        y -= logoDims.height + 20;
    }


    addText("Раздаточные материалы", 20, 0, regularFont, rgb(0.2, 0.2, 0.6));
    addDivider();


    addText("Конспект", 16, 0, regularFont);
    y -= 5;
    materials.summary.forEach((s: string) => addText("• " + s, 12, 10));
    addDivider();


    addText("Чек-лист", 16, 0, regularFont);
    y -= 5;
    materials.checklist.forEach((s: string) => addText("☑ " + s, 12, 10));
    addDivider();


    addText("Карточки", 16, 0, regularFont);
    y -= 5;
    materials.flashcards.forEach((f: any, i: number) => {
        addText(`${i + 1}. Вопрос: ${f.q}`, 12, 10, regularFont);
        addText(`   Ответ: ${f.a}`, 12, 20, regularFont, rgb(0.1, 0.5, 0.1));
        y -= 5;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
