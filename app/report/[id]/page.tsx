import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import ScoreGauge from "../../../components/ScoreGauge";
import TradingViewWidget from "../../../components/TradingViewWidget";
import { createClient } from "../../../utils/supabase/server";
import ShareButtons from "../../components/ShareButtons";
import LeadMagnet from "../../components/LeadMagnet";
import CompanyLogo from "../../../components/CompanyLogo";

// Force dynamic rendering since we are fetching data that changes
export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch report from Supabase
    const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Extract JSON Breakdown from markdown if it exists
    let scoreObj = { total: report.risk_score, breakdown: [] };
    let cleanMarkdown = report.detailed_report || '';

    if (cleanMarkdown.includes('<!-- SCORE_BREAKDOWN:')) {
        const match = cleanMarkdown.match(/<!--\s*SCORE_BREAKDOWN:\s*(\{[\s\S]*?\})\s*-->/);
        if (match && match[1]) {
            try {
                scoreObj = JSON.parse(match[1]);
            } catch (e) {
                console.error("Failed to parse SCORE_BREAKDOWN", e);
            }
        }
    }

    // Remove all HTML comments completely from the markdown to prevent any leaks
    cleanMarkdown = cleanMarkdown.replace(/<!--[\s\S]*?-->/g, '');

    // Determine color based on risk_score (acts as investment score)
    let scoreColor = "text-gray-400";
    if (scoreObj.total >= 80) scoreColor = "text-toss-red"; // High score is good/buy
    else if (scoreObj.total <= 30) scoreColor = "text-toss-blue"; // Low score is bad/sell

    // Check if the current user is the admin to bypass the paywall
    const supabaseServer = await createClient();

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 space-y-8 mb-20">
            <Link href="/" className="flex items-center text-gray-400 hover:text-white transition group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                BACK TO LIST
            </Link>

            <header className="border-b border-toss-border pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <CompanyLogo
                                ticker={report.ticker}
                                className="w-16 h-16 rounded-full object-contain bg-white p-1 shadow-lg shrink-0"
                            />
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                {report.ticker === 'TSLA' ? 'TESLA' : report.ticker} <span className="text-3xl text-zinc-500">({report.ticker})</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                            ANALYSIS REPORT #{report.id} • {new Date(report.created_at).toISOString().split('T')[0]}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="inline-block px-5 py-3 bg-toss-card rounded-2xl">
                                <p className="text-xs text-zinc-500 font-semibold mb-1">판정 (Verdict)</p>
                                <p className={`text-xl font-bold ${report.verdict === 'BUY' ? 'text-toss-red' : report.verdict === 'SELL' ? 'text-toss-blue' : 'text-yellow-500'}`}>
                                    {report.verdict || "N/A"}
                                </p>
                            </div>

                            {/* Share Buttons (Viral Loop) */}
                            <ShareButtons
                                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com'}/report/${report.id}`}
                                title={`${report.ticker} AI Deep Analysis Report | Truth of Market`}
                                description={report.one_line_summary || "Wall street lies exposed."}
                            />
                        </div>
                    </div>
                    {/* Pass isPro to any premium components if added later */}
                    <ScoreGauge scoreObj={scoreObj} scoreColor={scoreColor} />
                </div>
            </header>

            {/* Always Visible: Executive Summary */}
            <section className="bg-toss-card p-8 rounded-3xl">
                <h3 className="text-toss-red  text-sm mb-4 flex items-center">
                    <span className="w-2 h-2 bg-toss-red rounded-full mr-2 animate-pulse"></span>
                    핵심 요약 (EXECUTIVE SUMMARY)
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed font-medium">
                    {report.one_line_summary || "No executive summary available."}
                </p>
            </section>

            {/* Bull vs Bear Split */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-toss-card rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-toss-red"></div>
                    <h4 className="text-toss-red font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-toss-red"></span>
                        상승 관점 (THE BULL CASE)
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {report.bull_case_summary || report.ceo_claim || (() => {
                            try {
                                const parsed = JSON.parse(report.analysis_text);
                                return parsed.bull_case_summary || parsed.ceo_claim;
                            } catch { }
                            return "No data available.";
                        })()}
                    </p>
                </div>

                <div className="bg-toss-card rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-toss-blue"></div>
                    <h4 className="text-toss-blue font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-toss-blue"></span>
                        하락 관점 (THE BEAR CASE)
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {report.bear_case_summary || report.reality_check || (() => {
                            try {
                                const parsed = JSON.parse(report.analysis_text);
                                return parsed.bear_case_summary || parsed.reality_check;
                            } catch { }
                            return "No data available.";
                        })()}
                    </p>
                </div>
            </section>

            {/* Always Visible: TradingView Chart */}
            <section className="w-full h-[500px] rounded-3xl overflow-hidden bg-toss-card relative pt-16 pb-4 px-4">
                <div className="absolute top-4 left-4 z-10 bg-toss-bg px-4 py-1.5 rounded-full">
                    <span className="text-xs text-toss-red font-bold">기술적 분석 (TECHNICAL ANALYSIS)</span>
                </div>
                <div className="w-full h-full rounded-2xl overflow-hidden">
                    <TradingViewWidget ticker={report.ticker} />
                </div>
            </section>

            {/* Report Content */}
            <section className="mt-12">
                <div className="bg-toss-card rounded-3xl md:p-10 p-6">
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:mt-10 prose-headings:font-extrabold prose-h1:text-4xl prose-h2:text-3xl prose-p:leading-loose prose-p:text-zinc-300 prose-p:mb-8 prose-li:mb-3">
                        {cleanMarkdown ? (
                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{cleanMarkdown}</ReactMarkdown>
                        ) : (
                            <pre className=" text-gray-300 whitespace-pre-wrap">
                                {report.analysis_text}
                            </pre>
                        )}
                    </div>
                </div>
            </section>

            {/* Newsletter Subscription (Retention Loop) */}
            <section className="mt-20">
                <LeadMagnet />
            </section>
        </div>
    );
}
