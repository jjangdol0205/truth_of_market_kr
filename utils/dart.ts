import fs from 'fs';
import path from 'path';

// Load dart_codes.json safely
let dartCodes: Record<string, string> = {};
try {
    const jsonPath = path.join(process.cwd(), 'utils', 'dart_codes.json');
    if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        dartCodes = JSON.parse(raw);
    }
} catch (e) {
    console.error("Failed to load dart_codes.json", e);
}

export async function fetchDartFinancials(companyName: string) {
    const DART_API_KEY = process.env.DART_API_KEY;
    if (!DART_API_KEY) {
        console.warn("DART_API_KEY not found in env variables.");
        return null; // Silent failure to fallback to regular AI behavior
    }

    const corpCode = dartCodes[companyName];
    if (!corpCode) {
        console.warn(`No DART CorpCode found for company: ${companyName}`);
        return null;
    }

    // Try fetching the most recent reliable data. Let's start with 2024 Q3, then fallback to 2023 Annual
    const yearsToTry = ['2025', '2024', '2023'];
    const reprtCodesToTry = ['11011', '11014', '11012', '11013']; // Business, Q3, Half, Q1

    for (const year of yearsToTry) {
        for (const code of reprtCodesToTry) {
            try {
                const searchUrl = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${DART_API_KEY}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=${code}`;
                const res = await fetch(searchUrl, { next: { revalidate: 86400 } });

                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "000" && data.list && data.list.length > 0) {
                        return formatDartResponse(data.list, year, code);
                    }
                }
            } catch (err) {
                console.error(`DART Fetch failed for ${year} - ${code}`, err);
            }
        }
    }

    return null;
}

function formatDartResponse(list: any[], year: string, reprtCode: string): string {
    let reportName = "사업보고서";
    if (reprtCode === "11013") reportName = "1분기보고서";
    if (reprtCode === "11012") reportName = "반기보고서";
    if (reprtCode === "11014") reportName = "3분기보고서";

    let context = `### [Official DART Data] ${year}년 ${reportName} 재무 요약\n\n`;

    list.forEach(item => {
        // filter out only the most important metrics (Revenue, OP, Net Income, Assets, Liabilities)
        const accountNm = item.account_nm;
        const thstrm_amount = item.thstrm_amount; // Current Term Amount
        if (thstrm_amount) {
            context += `- **${accountNm}**: ${formatKRW(thstrm_amount)}\n`;
        }
    });

    return context;
}

// Convert absolute numbers to human-readable KRW (e.g. 1000000000000 -> 1조 원)
function formatKRW(valStr: string): string {
    const val = parseFloat(valStr.replace(/,/g, ''));
    if (isNaN(val)) return valStr;

    if (val >= 1e12) return (val / 1e12).toFixed(2) + '조 원';
    if (val >= 1e8) return (val / 1e8).toFixed(1) + '억 원';
    return val.toLocaleString('ko-KR') + '원';
}
