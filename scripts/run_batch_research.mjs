import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

let dartCodes = {};
try {
    const jsonPath = path.join(process.cwd(), 'utils', 'dart_codes.json');
    if (fs.existsSync(jsonPath)) {
        dartCodes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
} catch (e) {
    console.error("Failed to load dart_codes.json");
}

function formatKRW(valStr) {
    const val = parseFloat(valStr.replace(/,/g, ''));
    if (isNaN(val)) return valStr;

    if (val >= 1e12) return (val / 1e12).toFixed(2) + '조 원';
    if (val >= 1e8) return (val / 1e8).toFixed(1) + '억 원';
    return val.toLocaleString('ko-KR') + '원';
}

function formatDartResponse(list, year, reprtCode) {
    let reportName = "사업보고서";
    if (reprtCode === "11013") reportName = "1분기보고서";
    if (reprtCode === "11012") reportName = "반기보고서";
    if (reprtCode === "11014") reportName = "3분기보고서";

    let context = `### [Official DART Data] ${year}년 ${reportName} 재무 요약\n\n`;

    list.forEach(item => {
        const accountNm = item.account_nm;
        const thstrm_amount = item.thstrm_amount;
        if (thstrm_amount) {
            context += `- **${accountNm}**: ${formatKRW(thstrm_amount)}\n`;
        }
    });

    return context;
}

async function fetchDartFinancials(companyName) {
    const DART_API_KEY = process.env.DART_API_KEY;
    if (!DART_API_KEY) return null;

    const corpCode = dartCodes[companyName];
    if (!corpCode) return null;

    const yearsToTry = ['2025', '2024', '2023'];
    const reprtCodesToTry = ['11011', '11014', '11012', '11013'];

    for (const year of yearsToTry) {
        for (const code of reprtCodesToTry) {
            try {
                const searchUrl = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${DART_API_KEY}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=${code}`;
                const res = await fetch(searchUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "000" && data.list && data.list.length > 0) {
                        return formatDartResponse(data.list, year, code);
                    }
                }
            } catch (err) {
                // ignore
            }
        }
    }
    return null;
}

async function analyzeTickerLocal(tickerInput, numericTicker, reportType = "research", quarter = "") {
    const today = new Date().toISOString().split('T')[0];
    let ticker = tickerInput.trim();

    const dartData = await fetchDartFinancials(numericTicker);
    const dartContext = dartData ? `\n\n================================\n**CRITICAL DART FINANCIAL DATA (OFFICIAL)**\n${dartData}\n================================\n\n` : "";

    const tools = [
        {
            googleSearch: {} 
        },
    ];

    const modelsToTry = [
        "gemini-2.5-flash"
    ];

    let errorLog = [];

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
    - Analyze it strictly within the context of the South Korean stock market (KOSPI/KOSDAQ) or US stock market, considering local macroeconomics, regulations, and institutional/foreign investor flows.

    **OUTPUT FORMAT (CRITICAL)**:
    You MUST structure your response into TWO distinct parts to completely prevent JSON parsing errors.

    **CRITICAL**: All text, summaries, and reasons inside the JSON and Markdown MUST be in natural KOREAN (한국어).

    **PART 1: JSON METRICS**
    Provide the scores and summary strictly in valid JSON wrapped in a \`\`\`json code block. Do NOT include the detailed report in this JSON.
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
    - **CRITICAL**: The output MUST be strictly in professional financial KOREAN (한국어). Do NOT write the report in English. Use standard Korean stock market terminology.

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
    - Only report on the absolutely most recently closed Quarter before ${today}.
    ${dartContext}
    **STRICT SOURCE REQUIREMENT**:
    - Use \`Google Search\` to pull the exact Wall Street consensus estimates AND the resulting actual figures for the earnings release for ${ticker}.

    **OUTPUT CONSTRAINTS (CRITICAL)**:
    - Output strictly in valid **JSON format**. NO MARKDOWN OUTSIDE THE JSON BLOCK.
    - **CRITICAL**: For Korean Companies, REPLACE "EPS" with **"영업이익" (Operating Profit)**. This metric is far more important for Korean stocks.
    - **CRITICAL CURRENCY FORMAT**: Do NOT write "32조 3270억". You MUST format it beautifully with commas: **"32조 3,270억원"** or **"1,250원"**.
    - DO NOT generate a 10-chapter markdown report for this task.
    - **CRITICAL**: All text in the JSON (summaries, interpretations) MUST be in KOREAN (한국어).
    - **CRITICAL: You are writing JSON. YOU MUST ESCAPE ALL NEWLINES AS \\n AND ALL DOUBLE QUOTES AS \\" INSIDE STRING VALUES!**
    
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
    `;

    const prompt = reportType === "earnings" ? earningsPrompt : researchPrompt;

    for (const modelName of modelsToTry) {
        let attempt = 0;
        const maxAttempts = 5;
        let success = false;

        while (attempt < maxAttempts && !success) {
            try {
                console.log(`Trying model: ${modelName} for ${reportType} of ${tickerInput} (Attempt ${attempt + 1}/${maxAttempts})...`);

                const currentModel = genAI.getGenerativeModel({
                    model: modelName,
                    tools: tools,
                }, { apiVersion: "v1beta" });

                const result = await currentModel.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                let jsonString = "";
                let finalMarkdown = "";

                if (reportType === "research") {
                    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        throw new Error("No JSON block found in research response");
                    }
                    jsonString = jsonMatch[1] || jsonMatch[0];
                    finalMarkdown = text.replace(jsonMatch[0], '').replace(/```json/gi, '').replace(/```/g, '').trim();
                } else {
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
                    console.error("Error: SOURCE_DATA_MISSING.");
                    return;
                }

                let analysis;
                try {
                    analysis = JSON.parse(jsonString);

                    if (reportType === "research") {
                        if (!analysis.executive_summary) throw new Error("Missing executive_summary");
                        if (analysis.detailed_report_markdown && finalMarkdown.length < 100) {
                            finalMarkdown = analysis.detailed_report_markdown;
                        }
                        finalMarkdown += '\n\n<!-- SCORE_BREAKDOWN: ' + JSON.stringify(analysis.investment_score) + ' -->';
                    }
                } catch (e) {
                    console.error(`JSON Parse/Validation Error (${modelName}):`, e);
                    throw new Error(`JSON Parse error - ${e.message}`);
                }
                
                // Save to Local Output Folder
                const outputDir = path.join(process.cwd(), 'output_reports');
                if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
                
                const sanitizedTicker = tickerInput.replace(/[^a-zA-Z0-9가-힣]/g, '');
                const jsonFilename = path.join(outputDir, `${sanitizedTicker}_${reportType}.json`);
                fs.writeFileSync(jsonFilename, JSON.stringify(analysis, null, 2));
                if (reportType === "research") {
                     const mdFilename = path.join(outputDir, `${sanitizedTicker}_${reportType}.md`);
                     fs.writeFileSync(mdFilename, finalMarkdown);
                }
                
                try {
                    const { error } = await supabase
                        .from('reports')
                        .insert({
                            ticker: tickerInput.toUpperCase(),
                            risk_score: analysis.investment_score?.total || 50,
                            verdict: analysis.verdict || "HOLD",
                            one_line_summary: analysis.executive_summary,
                            detailed_report: finalMarkdown,
                            analysis_text: JSON.stringify(analysis),
                            report_type: reportType,
                            quarter: quarter || null
                        });

                    if (error) {
                        console.error("Supabase Save Warning (Network Error):", error.message);
                    } else {
                        console.log(`Successfully saved ${reportType} report to Supabase for ${tickerInput}!`);
                    }
                } catch (err) {
                     console.error("Supabase Save Error (ignoring):", err.message);
                }
                
                success = true; // Mark as successful to break out of while loop
                return; // Everything completed, return from analyzeTickerLocal

            } catch (error) {
                attempt++;
                console.error(`Attempt ${attempt} failed for model ${modelName} on ${tickerInput}:`, error.message);
                
                if (attempt < maxAttempts) {
                    // Exponential backoff: 5s, 10s, 20s, 40s (max 60s)
                    const waitMs = Math.min(5000 * Math.pow(2, attempt - 1), 60000);
                    console.log(`High demand or error. Waiting ${waitMs / 1000} seconds before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                } else {
                    errorLog.push(`${modelName}: ${error.message}`);
                    console.error(`Gave up after ${maxAttempts} attempts for ${tickerInput}.`);
                }
            }
        }
    }
}

async function main() {
    console.log("Starting Batch Deep Research & Earning Guidance...");
    const companies = [
        { name: "삼성전자", ticker: "005930" },
        { name: "SK하이닉스", ticker: "000660" },
        { name: "엘앤케이바이오", ticker: "156100" },
        { name: "LG에너지솔루션", ticker: "373220" },
        { name: "현대차", ticker: "005380" },
        { name: "기아", ticker: "000270" },
        { name: "NAVER", ticker: "035420" },
        { name: "카카오", ticker: "035720" },
        { name: "에코프로비엠", ticker: "247540" },
        { name: "셀트리온", ticker: "068270" },
        { name: "NVIDIA", ticker: "NVDA" },
        { name: "Apple", ticker: "AAPL" },
        { name: "Microsoft", ticker: "MSFT" },
        { name: "Tesla", ticker: "TSLA" },
        { name: "Meta", ticker: "META" },
        { name: "Amazon", ticker: "AMZN" },
        { name: "Alphabet", ticker: "GOOGL" },
        { name: "AMD", ticker: "AMD" },
        { name: "Palantir", ticker: "PLTR" },
        { name: "Broadcom", ticker: "AVGO" }
    ];

    for (const company of companies) {
        console.log(`\n==============================================`);
        console.log(`Processing ${company.name} (${company.ticker})`);
        console.log(`==============================================\n`);
        
        await analyzeTickerLocal(company.name, company.ticker, "research", "");
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay to avoid rate limit

        await analyzeTickerLocal(company.name, company.ticker, "earnings", "최근 분기");
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
    }
    
    console.log("Finished running all reports.");
}

main().catch(console.error);
