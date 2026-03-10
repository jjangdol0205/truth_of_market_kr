"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./lib/supabase";

import { createClient } from "@/utils/supabase/server";
import { fetchDartFinancials } from "@/utils/dart";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { resolveYahooTicker, getTickerFromName } from "@/utils/krx";

export async function resolveYahooTickerServer(ticker: string) {
    return resolveYahooTicker(ticker);
}

export async function fetchLivePricesServer(tickers: string[]) {
    // 1. Resolve all tickers to Yahoo Symbols concurrently
    const resolvedPromises = tickers.map(async (ticker) => {
        let queryTicker = ticker;
        const numericTicker = getTickerFromName(ticker);

        if (numericTicker) {
            queryTicker = await resolveYahooTicker(numericTicker);
        } else if (/^\d+$/.test(ticker)) {
            queryTicker = await resolveYahooTicker(ticker);
        } else if (ticker === "LNK") {
            queryTicker = "LINK-USD";
        }
        return { original: ticker, queryTicker };
    });

    const resolvedTickers = await Promise.all(resolvedPromises);

    // 2. Fetch prices concurrently
    const pricePromises = resolvedTickers.map(async ({ original, queryTicker }) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const meta = data?.chart?.result?.[0]?.meta;
                if (meta) {
                    const price = meta.regularMarketPrice;
                    const previousClose = meta.chartPreviousClose;
                    const changePercent = ((price - previousClose) / previousClose) * 100;
                    return { symbol: original, price, changePercent };
                }
            }
        } catch (e) {
            console.error(`Failed to fetch live price for ${queryTicker}`, e);
        }
        return { symbol: original, price: 0, changePercent: 0 };
    });

    return await Promise.all(pricePromises);
}

export async function analyzeTicker(tickerInput: string, numericTicker: string, reportType: "research" | "earnings" = "research", quarter: string = "") {
    // ENFORCE ADMIN SECURITY ON THE SERVER ACTION
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (session?.user?.email !== "beable9489@gmail.com") {
        return "Error: Unauthorized. Only the administrator can initialize analysis.";
    }

    let ticker = tickerInput.trim();

    // The user inputs the company name natively (e.g., "삼성전자").
    // We intentionally DO NOT resolve this to a numeric ticker, 
    // because we want Gemini, Supabase, and the UI to natively use the Korean company name.

    // 1. 비밀 금고(.env.local)에서 키 꺼내기
    const apiKey = process.env.GEMINI_API_KEY;
    // Add dynamically current Date to anchor the AI to the live present timeline
    const today = new Date().toISOString().split('T')[0];
    if (!apiKey) return "Error: API Key not found.";

    // 1.5 DART 전자공시 데이터 공식 발췌 (오피셜 데이터 주입)
    const dartData = await fetchDartFinancials(numericTicker);
    const dartContext = dartData ? `\n\n================================\n**CRITICAL DART FINANCIAL DATA (OFFICIAL)**\n${dartData}\n================================\n\n` : "";

    // 2. 제미나이 연결
    const genAI = new GoogleGenerativeAI(apiKey);

    // Google Search Grounding 도구 설정
    const tools: any = [
        {
            googleSearch: {} // New standard for 2.5 Flash and newer models
        },
    ];

    // Priority Model List
    const modelsToTry = [
        "gemini-2.5-flash"
    ];

    // Log to capture errors for each model
    let errorLog: string[] = [];

    // Dual-Mode Prompt Definitions
    const researchPrompt = `
    You are a top-tier Wall Street proprietary trader and analyst who perfectly combines Fundamental Analysis with Technical Analysis (Tracking Smart Money).
    Your goal is to assign an "Investment Score" (0-100) to the target company: ${ticker}.

    **STRICT TEMPORAL ANCHOR (CRITICAL)**:
    **CURRENT DATE (CRITICAL): The current date today is ${today}. All data, financial analysis, quarter reports, and trend projections MUST be calculated up to ${today}. Do NOT use 2024 data. YOU ARE IN THE YEAR 2026. USE THE LATEST AVAILABLE DATA UP TO ${today}.**
    - **TODAY IS ${today}. YOU ARE IN THE YEAR 2026.**
    - All of your analytics, fundamental health checks, trailing twelves months (TTM), and macro context MUST reflect the reality up to and including **${today}**.
    - DO NOT use old data from 2024. Pull the most recent earnings, the most recent product releases, and the absolute latest market conditions.
    ${dartContext}
    **STRICT SOURCE REQUIREMENT**:
    - Use \`Google Search\` to find the absolute latest real-time data and news for Company: ${tickerInput} (Ticker: ${numericTicker}) up to ${today}.
    - **CRITICAL**: The target company is exactly "${tickerInput}". Do not confuse it with any other company.
    - **CRITICAL FOR KOREAN STOCKS**: If this is a Korean company, you MUST search and extract data from the following authoritative Korean sources:
      1. **DART (전자공시시스템)**: Find the most recent quarterly/annual business reports (사업보고서, 분기보고서).
      2. **Naver Finance & News (네이버 증권/뉴스)**: Extract the latest headlines, institutional sentiment, and peer comparisons.
      3. **Korean Securities Firm Analyst Reports (증권사 리포트)**: Summarize the latest target prices and buy/sell consensus from major local brokerages (e.g., NH, Mirae, Samsung, Kiwoom).
    - Analyze it strictly within the context of the South Korean stock market (KOSPI/KOSDAQ), considering local macroeconomics, regulations, and institutional/foreign investor flows.

    **OUTPUT FORMAT (CRITICAL)**:
    You MUST structure your response into TWO distinct parts to completely prevent JSON parsing errors.

    **CRITICAL**: All text, summaries, and reasons inside the JSON and Markdown MUST be in natural KOREAN (한국어).

    **PART 1: JSON METRICS**
    Provide the scores and summary strictly in valid JSON wrapped in a \`\`\`json code block. Do NOT include the detailed report in this JSON.
    **CRITICAL INVESTOR FRAMEWORK SCORING**:
    You MUST break down the \`investment_score\` into exactly 4 categories summarizing: Valuation, Fundamental Health, Technical Trend, and Sentiment.
    Calculate these carefully based on real peer-comparison metrics.
    \`\`\`json
    {
      "investment_score": {
        "total": 85,
        "breakdown": [
          { "category": "Valuation (vs Peers)", "score": 22, "max_score": 30, "reason": "P/E is expanding but justified by 45% EPS growth." },
          { "category": "Fundamental Health & FCF", "score": 28, "max_score": 30, "reason": "Debt-to-equity below 0.5, expanding gross margins, robust FCF." },
          { "category": "Technical Trend & Smart Money", "score": 18, "max_score": 20, "reason": "Consistent volume accumulation above 50-day EMA." },
          { "category": "Catalysts & Market Sentiment", "score": 17, "max_score": 20, "reason": "Upcoming product cycle driving institutional upgrades." }
        ]
      },
      "verdict": "BUY",
      "executive_summary": "4 high-impact bullet points summarizing the core fundamental thesis.",
      "bull_case_summary": "2 sharp sentences on why this stock will explode upwards.",
      "bear_case_summary": "2 sharp sentences on the existential threat that could crush this stock."
    }
    \`\`\`

    **PART 2: DETAILED REPORT (MARKDOWN)**
    Immediately below the JSON block, write the 10-chapter Detailed Report in standard Markdown.
    - Provide deep, expansive analysis, analogies, and specific data points. (Aim for 150-200 words per chapter).
    - **CRITICAL FORMATTING INSTRUCTIONS (Readability)**: 
      1. Format the report to look like a premium **Korean Financial Newsletter**.
      2. You MUST use frequent **DOUBLE NEWLINES** to break apart paragraphs. Never write giant walls of text. Make the text highly readable for subscribers constraint to 3-4 sentences per paragraph.
      3. Use rich markdown: **Bold** key metrics, utilize bullet point lists, and use blockquotes (\`>\`) to highlight key takeaways.
    - **Chapter 8**: Identify EMAs, Base Building, 4-Stage Cycle, and Bear Traps concisely.
    - **CRITICAL**: The output MUST be strictly in professional financial KOREAN (한국어). Do NOT write the report in English. Use standard Korean stock market terminology (e.g., 매수/매도, 목표가, 지지선/저항선, 기관/외인 수급).

    # Table of Contents
    [프롤로그] 투자의 세계로 오신 것을 환영합니다
    ## 제 1장. 재무 건전성 점검
    ## 제 2장. 산업 분석과 매크로 환경
    ## 제 3장. 왜 이 기업인가?
    ## 제 4장. 사업보고서(10-K/공시) 해부
    ## 제 5장. 비즈니스 모델 분석
    ## 제 6장. 핵심 경쟁 우위 (해자)
    ## 제 7장. 주요 주가 상승 모멘텀
    ## 제 8장. 기술적 분석: 스마트머니의 흔적 🎯
    ## 제 9장. 잠재적 리스크 요인
    ## 제 10장. 적정 가치 평가
    [에필로그] 확신을 갖는 투자
    `;

    const earningsPrompt = `
    You are a top-tier Wall Street Equity Research Analyst focusing on earnings performance.
    Your goal is to parse and evaluate the specific ${quarter} earnings report for the target company: ${ticker}.
    The analyst needs critical Q-o-Q, Y-o-Y growth numbers, and Forward Guidance immediately summarized without hallucinations.
    
    **STRICT TEMPORAL ANCHOR (CRITICAL)**:
    - **TODAY IS ${today}. YOU ARE IN THE YEAR 2026.**
    - **TODAY IS ${today}. YOU ARE IN THE YEAR 2026.**
    - Only report on the absolutely most recently closed Quarter before ${today}.
    ${dartContext}
    **STRICT SOURCE REQUIREMENT**:
    - Use \`Google Search\` to pull the exact Wall Street consensus estimates AND the resulting actual figures for the ${quarter} earnings release for ${ticker}. (Or the equivalent consensus for Korean stocks).

    **OUTPUT CONSTRAINTS (CRITICAL)**:
    - Output strictly in valid **JSON format**. NO MARKDOWN OUTSIDE THE JSON BLOCK.
    - **CRITICAL**: For Korean Companies, REPLACE "EPS" with **"영업이익" (Operating Profit)**. This metric is far more important for Korean stocks.
    - **CRITICAL CURRENCY FORMAT**: Do NOT write "32조 3270억". You MUST format it beautifully with commas: **"32조 3,270억원"** or **"1,250원"**.
    - DO NOT generate a 10-chapter markdown report for this task.
    - **CRITICAL**: All text in the JSON (summaries, interpretations) MUST be in KOREAN (한국어).
    - **CRITICAL: You are writing JSON. YOU MUST ESCAPE ALL NEWLINES AS \n AND ALL DOUBLE QUOTES AS \" INSIDE STRING VALUES!**
    
    **OUTPUT JSON STRUCTURE:**
    {
        "actual_eps": "3조 2,500억원",
        "est_eps": "2조 9,000억원",
        "actual_rev": "25조 1,000억원",
        "est_rev": "24조 5,000억원",
        "guidance_summary": "경영진은 폭발적인 AI 수요를 근거로 연간 가이던스를 15% 상향 조정했습니다.",
        "ai_interpretation": "강력한 매수 신호. 영업이익과 매출 모두 컨센서스를 상회했으며, 가이던스 상향은 강력한 가격 결정력을 의미합니다.",
        "verdict": "BUY",
        "executive_summary": "영업이익 및 매출 예상치 상회, 강력한 향후 가이던스 제시.",
        "investment_score": { "total": 90 }
    }
    
    CRITICAL INSTRUCTION: You must output ONLY valid, raw JSON. Do NOT wrap the JSON in markdown formatting or code blocks. Do NOT include any conversational text or explanations outside the JSON.
    `;

    const prompt = reportType === "earnings" ? earningsPrompt : researchPrompt;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName}...`);

            // Remove incompatible generationConfig for tools
            const currentModel = genAI.getGenerativeModel({
                model: modelName,
                tools: tools,
            }, { apiVersion: "v1beta" });

            const result = await currentModel.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Debug logging
            console.log(`Model ${modelName} raw response length:`, text.length);

            let jsonString = "";
            let finalMarkdown = "";

            if (reportType === "research") {
                // Safely extract the JSON block from the mixed response
                const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("No JSON block found in research response");
                }

                jsonString = jsonMatch[1] || jsonMatch[0];

                // Extract everything that IS NOT the JSON string to form the robust markdown body
                finalMarkdown = text.replace(jsonMatch[0], '').trim();

            } else {
                // Earnings are entirely JSON, use robust cleanup
                let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                const start = cleanText.indexOf('{');
                const end = cleanText.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    cleanText = cleanText.substring(start, end + 1);
                }
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON found in earnings response");
                jsonString = jsonMatch[0];
            }

            if (jsonString.includes("SOURCE_DATA_MISSING")) {
                return "Error: SOURCE_DATA_MISSING. (Cannot find latest data. Please check ticker.)";
            }

            let analysis;
            try {
                analysis = JSON.parse(jsonString);
                console.log(`Parsed JSON keys:`, Object.keys(analysis)); // Validating keys

                if (reportType === "research") {
                    if (!analysis.executive_summary) {
                        throw new Error("Missing executive_summary");
                    }
                    // Handle edge cases where LLM ignored instructions and put markdown inside JSON
                    if (analysis.detailed_report_markdown && finalMarkdown.length < 100) {
                        finalMarkdown = analysis.detailed_report_markdown;
                    }
                    // Append the dynamic scores directly to the safe markdown payload
                    finalMarkdown += '\n\n<!-- SCORE_BREAKDOWN: ' + JSON.stringify(analysis.investment_score) + ' -->';
                } else {
                    if (!analysis.actual_eps || !analysis.guidance_summary) {
                        throw new Error("Missing required earnings fields");
                    }
                }
            } catch (e: any) {
                console.error(`JSON Parse/Validation Error (${modelName}):`, e);
                console.error("Failed JSON Text snippet:", jsonString.substring(0, 300));
                errorLog.push(`${modelName}: JSON Parse error - ${e.message}`);
                continue;
            }

            const { error } = await supabase
                .from('reports')
                .insert({
                    ticker: tickerInput.toUpperCase(), // Save the company name intentionally
                    risk_score: analysis.investment_score?.total || 50,
                    verdict: analysis.verdict || "HOLD",
                    one_line_summary: analysis.executive_summary,
                    detailed_report: finalMarkdown,
                    analysis_text: JSON.stringify(analysis),
                    report_type: reportType,
                    quarter: quarter || null
                });

            if (error) {
                console.error("Supabase Save Error:", error);
                return `Error: Failed to save to Database - ${error.message}`;
            }

            return JSON.stringify(analysis);

        } catch (error: any) {
            console.error(`Model ${modelName} failed:`, error.message);
            errorLog.push(`${modelName}: ${error.message}`);

            if (error.message?.includes("API key")) {
                return "Error: API Key Invalid.";
            }

            if (!error.message?.includes("429")) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            continue;
        }
    }

    // Return detailed error log to user
    return `Error: All models failed to analyze.\n\n[Details]\n${errorLog.join("\n")}`;
}

export async function generateDailyBriefingAdmin() {
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (session?.user?.email !== "beable9489@gmail.com") {
        return "Error: Unauthorized. Only the administrator can generate briefings.";
    }

    try {
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

        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
        const model = google("gemini-2.5-flash");

        const { text } = await generateText({
            model: model,
            prompt: prompt,
            temperature: 0.7,
        });

        let title = `마켓 브리핑: ${dateStr}`;
        let content = text;

        const titleMatch = text.match(/^(?:\*\*)?TITLE\s*:\s*(?:\*\*)?(.*)$/im);
        if (titleMatch) {
            title = titleMatch[1].replace(/\*\*/g, '').trim();
            content = text.replace(titleMatch[0], '').trim();
        }

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
            return `Error: Failed to save summary to database - ${error.message}`;
        }

        return JSON.stringify({
            success: true,
            title: title,
            content: content
        });

    } catch (error: any) {
        return `Error: Internal server error - ${error.message}`;
    }
}