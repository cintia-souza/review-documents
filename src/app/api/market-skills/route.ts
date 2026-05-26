import { NextRequest, NextResponse } from "next/server";
import { analyzeSkills } from "@/lib/linkedin/analyzer";
import { saveMarketAnalysis, getLatestMarketAnalysis } from "@/lib/linkedin/market";

// GET: Retorna a análise mais recente cacheada
export async function GET(request: NextRequest) {
  const searchTag = request.nextUrl.searchParams.get("tag") || "front-end";

  const cached = await getLatestMarketAnalysis(searchTag);
  if (!cached) {
    return NextResponse.json({ error: "Nenhuma análise disponível" }, { status: 404 });
  }

  return NextResponse.json(cached);
}

// POST: Recebe descrições do scraper e gera/salva análise
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.SCRAPER_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    searchTag: string;
    totalScraped: number;
    descriptions: string[];
  };

  if (!body.descriptions?.length) {
    return NextResponse.json({ error: "Nenhuma descrição fornecida" }, { status: 400 });
  }

  const skills = analyzeSkills(body.descriptions);

  const analysis = await saveMarketAnalysis({
    searchTag: body.searchTag || "front-end",
    totalScraped: body.totalScraped || body.descriptions.length,
    totalAnalyzed: body.descriptions.length,
    skills,
  });

  return NextResponse.json(analysis, { status: 201 });
}
