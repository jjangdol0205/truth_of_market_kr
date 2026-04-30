import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "../app/lib/supabase";

// GitHub Actions에서 독립적으로 실행할 Node.js 스크립트

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
    try {
        console.log("[Script] Starting Daily Market Summary Generation...");

        // 1. Fetch Live Market Tickers from Yahoo Finance
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

        if (!marketDataStr) {
            marketDataStr = "Market data unavailable today.";
        }

        const dateStr = new Date().toISOString().split('T')[0];

        // 2. Prompt Gemini AI to write the summary
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

        let text = "";
        try {
            const { text: generatedText } = await generateText({
                model: google("gemini-2.5-flash"),
                prompt: prompt,
                temperature: 0.7,
                maxRetries: 5,
            });
            text = generatedText;
        } catch (error) {
            console.warn("[Script] gemini-2.5-flash failed (likely 503 High Demand). Waiting 10s and trying gemini-1.5-flash fallback...");
            await new Promise(resolve => setTimeout(resolve, 10000));
            const { text: fallbackText } = await generateText({
                model: google("gemini-1.5-flash"),
                prompt: prompt,
                temperature: 0.7,
                maxRetries: 5,
            });
            text = fallbackText;
        }

        // 3. Parse the Title and Content
        let title = `마켓 브리핑: ${dateStr}`;
        let content = text;

        const titleMatch = text.match(/^(?:\*\*)?TITLE\s*:\s*(?:\*\*)?(.*)$/im);
        if (titleMatch) {
            title = titleMatch[1].replace(/\*\*/g, '').trim();
            content = text.replace(titleMatch[0], '').trim();
        }

        // 4. Save to Supabase
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
            console.error("[Script] DB Error:", error);
            process.exit(1);
        }

        console.log(`[Script] Successfully generated and saved summary for ${dateStr}`);
        process.exit(0);

    } catch (error: any) {
        console.error('[Script] Fatal error:', error);
        process.exit(1);
    }
}

main();
