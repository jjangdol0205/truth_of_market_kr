"use client";

import { useState } from "react";
import InvestmentGauge from "./InvestmentGauge";
import ReactMarkdown from 'react-markdown';
import { Activity } from 'lucide-react';
import FinancialTable from "./FinancialTable";

interface ReportCardProps {
    report: {
        id: number;
        ticker: string;
        investment_score?: number;
        risk_score?: number;
        verdict: string;
        one_line_summary: string;
        created_at: string;
        bull_case_summary?: string;
        bear_case_summary?: string;
        ceo_claim?: string;
        reality_check?: string;
        detailed_report?: string;
        financial_table?: any;
        analysis_text?: string;
    };
    queryTicker?: string;
}

export default function ReportCard({ report, queryTicker }: ReportCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [isScoreOpen, setIsScoreOpen] = useState(false);
    const score = report.investment_score ?? report.risk_score ?? 50;

    let scoreBreakdown: any[] = [];

    // First, try extracting from the detailed_report HTML comment
    if (report.detailed_report) {
        const match = report.detailed_report.match(/<!--\s*SCORE_BREAKDOWN:\s*(\{[\s\S]*?\})\s*-->/);
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1]);
                if (parsed && parsed.breakdown) {
                    scoreBreakdown = parsed.breakdown;
                }
            } catch (e) {
                console.error("Failed to parse SCORE_BREAKDOWN", e);
            }
        }
    }

    // Fallback: parse analysis_text directly if comment regex fails
    let parsedAnalysis: any = {};
    if (report.analysis_text) {
        try {
            parsedAnalysis = typeof report.analysis_text === 'string' ? JSON.parse(report.analysis_text) : report.analysis_text;
            if (scoreBreakdown.length === 0 && parsedAnalysis?.investment_score?.breakdown) {
                scoreBreakdown = parsedAnalysis.investment_score.breakdown;
            }
        } catch (e) {
            console.error("Failed to parse analysis_text", e);
        }
    }

    const bullCase = report.bull_case_summary || parsedAnalysis?.bull_case_summary || report.ceo_claim || parsedAnalysis?.ceo_claim || "데이터가 없습니다.";
    const bearCase = report.bear_case_summary || parsedAnalysis?.bear_case_summary || report.reality_check || parsedAnalysis?.reality_check || "데이터가 없습니다.";

    return (
        <div className="bg-[#18181a]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl font-sans mb-8 transition-all hover:border-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Header: Ticker & Badges */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white tracking-tight">{report.ticker}</span>
                    <span className="text-xs  text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        {new Date(report.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-full tracking-wide ${report.verdict === 'BUY' ? 'bg-toss-red/10 text-toss-red border border-toss-red/20' :
                    report.verdict === 'SELL' ? 'bg-toss-blue/10 text-toss-blue border border-toss-blue/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                    {report.verdict === 'BUY' ? '매수' : report.verdict === 'SELL' ? '매도' : '보유'}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Top Left: Investment Gauge (Span 4) */}
                <div
                    className="md:col-span-4 bg-[#0B0B0D]/50 rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center relative min-h-[200px] cursor-pointer hover:border-white/10 transition-colors group"
                    onClick={() => setIsScoreOpen(true)}
                >
                    <InvestmentGauge score={score} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        상세 분석 보기 ↗
                    </div>
                </div>

                {/* Score Modal Overlay */}
                {isScoreOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-toss-card/80 backdrop-blur-sm p-4">
                        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsScoreOpen(false); }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-white mb-6">AI 투자 점수 분석</h3>

                            {scoreBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {scoreBreakdown.map((item, idx) => (
                                        <div key={idx} className="bg-[#09090b] border border-[#27272a] rounded-2xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-zinc-200">{item.category}</h4>
                                                <span className={` font-bold ${item.score >= (item.max_score * 0.7) ? 'text-toss-red' : item.score <= (item.max_score * 0.4) ? 'text-toss-blue' : 'text-yellow-500'}`}>
                                                    {item.score} <span className="text-zinc-500 text-sm">/ {item.max_score}</span>
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.score >= (item.max_score * 0.7) ? 'bg-toss-red' : item.score <= (item.max_score * 0.4) ? 'bg-toss-blue' : 'bg-yellow-500'}`}
                                                    style={{ width: `${(item.score / item.max_score) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                {item.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    해당 보고서는 세부 분석 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Top Right: Analyst Summary (Span 8) */}
                <div className="md:col-span-8 bg-[#0B0B0D]/50 rounded-3xl border border-white/5 p-6 flex flex-col justify-center transition-all hover:border-white/10">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">AI 핵심 요약</h4>
                    <div className="text-zinc-100 text-lg font-medium leading-relaxed">
                        {(() => {
                            try {
                                const parsedLines = JSON.parse(report.one_line_summary || "[]");
                                if (Array.isArray(parsedLines) && parsedLines.length > 0) {
                                    return (
                                        <ul className="space-y-4">
                                            {parsedLines.map((line: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-zinc-300">
                                                    <span className="text-zinc-500 mt-1.5 flex-shrink-0">•</span>
                                                    <span className="leading-relaxed">{line}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                            } catch { }
                            return <p>{report.one_line_summary || "No executive summary available."}</p>;
                        })()}
                    </div>
                </div>

                {/* 4. Bottom Split: Bull vs Bear (Span 6 each) */}
                <div className="md:col-span-6 bg-[#0B0B0D]/50 rounded-3xl border border-toss-red/20 p-6 relative overflow-hidden group hover:border-toss-red/40 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-toss-red to-transparent opacity-50"></div>
                    <h4 className="text-toss-red font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-toss-red"></span>
                        상승 잠재력
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {bullCase}
                    </p>
                </div>

                <div className="md:col-span-6 bg-[#0B0B0D]/50 rounded-3xl border border-toss-blue/20 p-6 relative overflow-hidden group hover:border-toss-blue/40 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-toss-blue to-transparent opacity-50"></div>
                    <h4 className="text-toss-blue font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-toss-blue"></span>
                        하락 리스크
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {bearCase}
                    </p>
                </div>

                <div className="md:col-span-12 mt-4 flex justify-center">
                    <a
                        href={`https://kr.tradingview.com/chart/?symbol=KRX:${queryTicker ? queryTicker.replace('.KS', '') : report.ticker.replace('.KS', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex flex-col md:flex-row items-center justify-center gap-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 3H3C1.895 3 1 3.895 1 5V19C1 20.105 1.895 21 3 21H21C22.105 21 23 20.105 23 19V5C23 3.895 22.105 3 21 3ZM21 19H3V5H21V19Z" fill="#5D6A7E" />
                                <path d="M15 15L17 11V15H15Z" fill="#2962FF" />
                                <path d="M12 15L14 10.5V15H12Z" fill="#2962FF" />
                                <path d="M9 15L11 9V15H9Z" fill="#2962FF" />
                                <path d="M6 15L8 12V15H6Z" fill="#2962FF" />
                            </svg>
                            <span>TradingView 차트 보기</span>
                        </div>
                    </a>
                </div>

                {/* 5. Financials (Span 12) */}
                {report.financial_table && (
                    <div className="md:col-span-12">
                        <FinancialTable data={report.financial_table} />
                    </div>
                )}

            </div>

        </div >
    );
}
