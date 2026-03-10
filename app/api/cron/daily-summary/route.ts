import { NextResponse } from 'next/server';
import { supabase } from "../../../lib/supabase";

// We import the AI SDK for Gemini
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Vercel Cron will hit this URL automatically
export async function GET(req: Request) {
    try {
        // 1. Basic Security: Ensure the request comes from Vercel's Cron Infrastructure
        // Vercel sends a specific Authorization header with the cron secret we set
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Disable this check locally or if secret isn't set for easy manual testing during dev.
        // In production, ALWAYS set CRON_SECRET in Vercel.
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log("[Cron] Starting Daily Market Summary Generation...");

        // 2. Fetch Live Market Tickers from Yahoo Finance
        // ^KS11 = KOSPI, ^KQ11 = KOSDAQ, ^GSPC = S&P 500
        const indices = ['^KS11', '^KQ11', '^GSPC'];
        let marketDataStr = "";

        const fetchPromises = indices.map(async (ticker) => {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
            try {
                const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
                const data = await res.json();
                const meta = data?.chart?.result?.[0]?.meta;
                if (meta) {
                    const price = meta.regularMarketPrice;
                    const prevClose = meta.chartPreviousClose;
                    const changePercent = ((price - prevClose) / prevClose) * 100;
                    const name = ticker === '^KS11' ? '코스피 (KOSPI)' : ticker === '^KQ11' ? '코스닥 (KOSDAQ)' : 'S&P 500';
                    marketDataStr += `${name}: ${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)\n`;
                }
            } catch (e) {
                console.error(`Failed to fetch index ${ticker}`, e);
            }
        });

        await Promise.all(fetchPromises);

        // Fallback if Yahoo Finance fails
        if (!marketDataStr) {
            marketDataStr = "Market data unavailable today.";
        }

        const dateStr = new Date().toISOString().split('T')[0];

        // 3. Prompt Gemini AI to write the summary
        const prompt = `
You are a highly analytical, objective, and professional Wall Street algorithmic analyst.
Your job is to write a short, punchy, 3-paragraph "Daily Market Briefing".
This is for the end of the US and Korean trading day on ${dateStr}.

Here is the raw closing data for the major indices:
${marketDataStr}

Instructions:
1. Write exactly 3 sections (can use bullet points).
2. Section 1: 요약 및 주요 지수 (Executive Summary & Indices). Summarize if the market went up or down, the overall sentiment, AND explicitly list the 1-day percentage change for KOSPI, KOSDAQ, and S&P 500 using the raw data provided above.
3. Section 2: 주요 시장 동인 (Top 3 Market Drivers). Identify and list the 3 most important news headlines, macro events, or sector shifts that drove the **Korean market (코스피/코스닥)** today. Use bullet points for these 3 items. Focus primarily on domestic issues, foreign/institutional flows, and how global macro impacted Korea.
4. Section 3: AI 투자 전망 (The AI Verdict). Give a 1-sentence forward-looking thought or technical warning regarding the Korean market.
5. Format the text nicely in Markdown. Use bolding for key terms. DO NOT use emojis. Write ENTIRELY in professional KOREAN (한국어). Do NOT write in English.

Title Requirement:
The very first line of your response MUST BE the title formatted strictly like this:
TITLE: [전문적인 한국어 제목]
Content begins on the next line.
`;

        const model = google("gemini-2.5-flash");

        const { text } = await generateText({
            model: model,
            prompt: prompt,
            temperature: 0.7,
        });

        // 4. Parse the Title and Content
        let title = `마켓 브리핑: ${dateStr}`;
        let content = text;

        const titleMatch = text.match(/^(?:\*\*)?TITLE\s*:\s*(?:\*\*)?(.*)$/im);
        if (titleMatch) {
            title = titleMatch[1].replace(/\*\*/g, '').trim();
            content = text.replace(titleMatch[0], '').trim();
        }

        // 5. Save to Supabase
        // We use an upsert/onConflict approach to avoid duplicate daily summaries if cron runs twice by accident
        const { error } = await supabase
            .from('market_summaries')
            .upsert(
                {
                    date: dateStr,
                    title: title,
                    content: content
                },
                { onConflict: 'date' }
            );

        if (error) {
            console.error("[Cron DB Error]:", error);
            return NextResponse.json({ error: 'Failed to save summary to database' }, { status: 500 });
        }

        console.log(`[Cron] Successfully generated and saved summary for ${dateStr}`);
        return NextResponse.json({ success: true, date: dateStr, title });

    } catch (error: any) {
        console.error('[Cron] Fatal error generating daily summary:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message, stack: error.stack }, { status: 500 });
    }
}
