import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text.slice(0, 8000);
}
