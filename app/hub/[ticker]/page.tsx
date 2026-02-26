import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import TradingViewWidget from "../../../components/TradingViewWidget";
import HubTabs from "../../components/HubTabs";
import ReportCard from "../../components/ReportCard";
import CompanyLogo from "../../../components/CompanyLogo";
import { getKoreanName } from "../../../utils/krx";

// Ensure dynamic fetching so pricing/reports are fresh
export const revalidate = 0;

export default async function CompanyHubPage({ params }: { params: Promise<{ ticker: string }> }) {
    const { ticker: rawTicker } = await params;
    const ticker = decodeURIComponent(rawTicker).toUpperCase();

    // 1. Fetch all reports for this specific ticker (Fetch ALL columns to populate ReportCard)
    const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('ticker', ticker)
        .order('created_at', { ascending: false });

    // Separate newest research report from the rest
    const researchReports = (reports || []).filter(r => !r.report_type || r.report_type === "research");
    const earningsReports = (reports || []).filter(r => r.report_type === "earnings");

    const latestResearch = researchReports.length > 0 ? researchReports[0] : null;
    const archivedResearch = researchReports; // Show all reports in the archive tab, including the easiest one
    const archiveReportsForTabs = [...archivedResearch, ...earningsReports];

    let livePrice = 0;
    let changePercent = 0;

    // Analyst Consensus Data
    let targetMeanPrice = 0;
    let analystCount = 0;

    let queryTicker = ticker;
    if (/^\d+$/.test(ticker)) {
        queryTicker = `${ticker}.KS`;
    } else if (ticker === "LNK") {
        queryTicker = "LINK-USD";
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`;
    const targetUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${queryTicker}?modules=financialData`;

    try {
        const [res, targetRes] = await Promise.all([
            fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } }),
            fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } })
        ]);

        if (res.ok) {
            const data = await res.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta) {
                livePrice = meta.regularMarketPrice;
                const prev = meta.chartPreviousClose;
                changePercent = ((livePrice - prev) / prev) * 100;
            }
        }

        if (targetRes.ok) {
            const targetData = await targetRes.json();
            const finData = targetData?.quoteSummary?.result?.[0]?.financialData;
            if (finData) {
                targetMeanPrice = finData.targetMeanPrice?.raw || 0;
                analystCount = finData.numberOfAnalystOpinions?.raw || 0;
            }
        }

    } catch (err) {
        console.error("Failed to fetch yahoo finance data strictly for hub:", err);
    }

    const isPositive = changePercent >= 0;
    const colorClass = isPositive ? "text-toss-red" : "text-toss-blue";

    // Analyst Upside Math
    let upsidePercent = 0;
    if (livePrice > 0 && targetMeanPrice > 0) {
        upsidePercent = ((targetMeanPrice - livePrice) / livePrice) * 100;
    }
    const isTargetPositive = upsidePercent >= 0;
    const targetColorClass = isTargetPositive ? "text-toss-red" : "text-toss-blue";

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 space-y-8 mb-20 font-sans">
            <Link href="/" className="flex items-center text-zinc-500 hover:text-white transition group w-fit  text-sm tracking-tight uppercase">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            {/* TOP SECTION: Price & Chart Matrix */}
            <div className="bg-toss-card border-none rounded-3xl p-6 shadow-lg relative overflow-hidden">

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <CompanyLogo
                            ticker={ticker}
                            className="w-20 h-20 rounded-full object-contain bg-white p-1.5 shadow-lg shrink-0"
                        />
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white mb-1">
                                {getKoreanName(ticker)}
                            </h1>
                            <p className="text-indigo-500 flex items-center  text-xs font-bold tracking-tight uppercase mb-1">
                                <Activity className="w-3 h-3 mr-1" /> 인증된 기업 허브
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Current Market Price Block */}
                        <div className="text-left md:text-right bg-toss-bg p-4 rounded-2xl border-none relative overflow-hidden">
                            <div className={`absolute left-0 top-0 w-1.5 h-full ${isPositive ? 'bg-toss-red' : 'bg-toss-blue'}`}></div>
                            <p className="text-xs text-zinc-500 uppercase tracking-tight font-bold mb-1 ml-2">실시간 시장 데이터</p>
                            <div className="flex items-baseline md:justify-end gap-3 ml-2">
                                <h2 className="text-4xl font-black text-white ">
                                    ₩{livePrice ? livePrice.toLocaleString('ko-KR') : "0"}
                                </h2>
                                <span className={` text-lg font-bold ${colorClass}`}>
                                    {isPositive ? "+" : ""}{changePercent ? changePercent.toFixed(2) : "0.00"}%
                                </span>
                            </div>
                        </div>

                        {/* Analyst Consensus Target Block */}
                        {targetMeanPrice > 0 && (
                            <div className="text-left md:text-right bg-toss-bg p-4 rounded-2xl border-none relative overflow-hidden group hover:opacity-90 transition-opacity">
                                <div className={`absolute left-0 top-0 w-1.5 h-full ${isTargetPositive ? 'bg-toss-red' : 'bg-toss-blue'}`}></div>
                                <div className="flex items-center md:justify-end gap-2 mb-1 ml-2">
                                    <p className="text-xs text-indigo-400 uppercase tracking-tight font-bold">월스트리트 컨센서스</p>
                                    <span className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full  font-bold">
                                        {analystCount} 애널리스트 평가
                                    </span>
                                </div>
                                <div className="flex items-baseline md:justify-end gap-3 ml-2">
                                    <h2 className="text-2xl font-black text-white ">
                                        ₩{targetMeanPrice.toLocaleString('ko-KR')}
                                    </h2>
                                    <span className={` text-sm font-bold bg-toss-card px-2 py-0.5 rounded border border-toss-border ${targetColorClass}`}>
                                        {isTargetPositive ? "+" : ""}{upsidePercent.toFixed(2)}% 상승 여력
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
            </div>

            {/* LATEST AI ANALYSIS (PROMINENT DISPLAY) */}
            {latestResearch ? (
                <div className="mt-12">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-toss-red shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse"></span>
                        최신 AI 심층 분석
                    </h2>
                    {/* Re-use our beautiful ReportCard component! */}
                    <ReportCard report={latestResearch} />
                </div>
            ) : (
                /* Securely Bound TradingView Widget Backup */
                <section className="mt-8 w-full h-[450px] rounded-2xl overflow-hidden border-none bg-toss-bg shadow-sm relative z-10">
                    <div className="absolute top-4 left-4 z-20 bg-toss-card px-3 py-1.5 rounded-full shadow-sm">
                        <span className="text-[10px] text-toss-red  tracking-tight uppercase">실시간 기술적 분석</span>
                    </div>
                    {/* Render Widget */}
                    <div className="w-full h-full relative z-10">
                        <TradingViewWidget ticker={ticker} />
                    </div>
                </section>
            )}

            {/* MIDDLE SECTION: Interactive Tabs (Archive & Earnings) */}
            <div className="mt-16">
                <h2 className="text-2xl font-black text-white mb-6">심층 리서치 보관함 & 어닝스 리포트</h2>
                <HubTabs ticker={ticker} reports={archiveReportsForTabs} />
            </div>
        </div>
    );
}
