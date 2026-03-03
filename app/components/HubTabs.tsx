"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FileText, TrendingUp, Calendar, ChevronDown, CheckCircle, XCircle, BrainCircuit, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface HubTabsProps {
    ticker: string;
    reports: any[];
}

export default function HubTabs({ ticker, reports }: HubTabsProps) {
    const [activeTab, setActiveTab] = useState<"archive" | "earnings">("archive");
    const [openQuarter, setOpenQuarter] = useState<string>("Q3 2024");
    const [openReport, setOpenReport] = useState<number | null>(null);

    const activeReports = reports || [];
    const researchReports = activeReports.filter(r => !r.report_type || r.report_type === "research");
    const earningsReports = activeReports.filter(r => r.report_type === "earnings");

    // We can remove the mock data since we are now mapping actual `earningsReports`

    return (
        <div className="w-full mt-12 bg-[#18181A]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/5 bg-[#0B0B0D]/50 backdrop-blur-md">
                <button
                    onClick={() => setActiveTab("archive")}
                    className={`flex-1 p-5 text-sm font-bold uppercase tracking-tight flex items-center justify-center gap-2 transition-colors ${activeTab === "archive" ? "bg-zinc-900 text-indigo-400 border-b-2 border-indigo-400" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"}`}
                >
                    <FileText className="w-5 h-5" />
                    심층 리서치 보관함
                </button>
                <button
                    onClick={() => setActiveTab("earnings")}
                    className={`flex-1 p-5 text-sm font-bold uppercase tracking-tight flex items-center justify-center gap-2 transition-colors ${activeTab === "earnings" ? "bg-zinc-900 text-indigo-400 border-b-2 border-indigo-400" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"}`}
                >
                    <TrendingUp className="w-5 h-5" />
                    어닝 & 가이던스
                </button>
            </div>

            {/* Tab Content Area */}
            <div className="p-6 md:p-10 bg-toss-card">
                {/* -------------------- TAB A: ARCHIVE -------------------- */}
                {activeTab === "archive" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-white">과거 AI 분석 보고서 보관함</h3>
                            <span className="text-zinc-500  text-sm">{researchReports.length} 건의 분석</span>
                        </div>

                        {researchReports.length === 0 ? (
                            <div className="p-12 text-center border border-toss-border border-dashed rounded-2xl bg-toss-card/50">
                                <p className="text-zinc-500 ">데이터베이스에 {ticker}의 분석 기록이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {researchReports.map((report) => {
                                    const score = report.risk_score;
                                    const isGood = score >= 80;
                                    const isBad = score <= 40;
                                    const isOpen = openReport === report.id;

                                    let cleanMarkdown = report.detailed_report || '';
                                    cleanMarkdown = cleanMarkdown.replace(/<!--[\s\S]*?-->/g, '');

                                    return (
                                        <Link key={report.id} href={`/report/${report.id}`} className="block border border-white/5 rounded-3xl overflow-hidden bg-[#18181A]/50 transition-all hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] group">
                                            <div className="w-full text-left bg-transparent group-hover:bg-white/5 p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-4 h-4 text-indigo-500/50" />
                                                        <span className="text-xs  text-zinc-400 font-bold uppercase tracking-tight">
                                                            리포트 #{report.id} • {new Date(report.created_at).toISOString().split('T')[0]}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                                        심층 리서치: {report.ticker} 데이터 세트
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs text-zinc-500 mb-1  uppercase tracking-tight">AI 요약</p>
                                                        <p className={`font-black  tracking-tight ${report.verdict === 'BUY' ? 'text-toss-red' : report.verdict === 'SELL' ? 'text-toss-blue' : 'text-yellow-500'}`}>
                                                            {report.verdict === 'BUY' ? '매수' : report.verdict === 'SELL' ? '매도' : '보유'}
                                                        </p>
                                                    </div>
                                                    <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[90px] ${isGood ? 'bg-red-950/30 border-toss-red/30' : isBad ? 'bg-blue-950/30 border-toss-blue/30' : 'bg-yellow-950/30 border-yellow-500/30'}`}>
                                                        <span className={`text-2xl font-black  leading-none ${isGood ? 'text-toss-red' : isBad ? 'text-toss-blue' : 'text-yellow-500'}`}>{score}</span>
                                                        <span className="text-[10px] text-zinc-500 uppercase mt-1 font-bold">종합 점수</span>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* -------------------- TAB B: EARNINGS -------------------- */}
                {activeTab === "earnings" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-white">실적 발표 일정 및 요약 <span className="text-sm font-medium text-indigo-500 ml-2 border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 rounded">실시간 DB 연동</span></h3>
                            <span className="text-zinc-500  text-sm">{earningsReports.length} 건 발표됨</span>
                        </div>

                        {earningsReports.length === 0 ? (
                            <div className="p-12 text-center border border-toss-border border-dashed rounded-2xl bg-toss-card/50">
                                <p className="text-zinc-500 ">아직 {ticker}의 실적 발표 리포트가 생성되지 않았습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {earningsReports.map((report) => {
                                    let parsed = {} as any;
                                    try {
                                        if (report.analysis_text) {
                                            parsed = JSON.parse(report.analysis_text);
                                        }
                                    } catch (e) {
                                        return null;
                                    }

                                    const quarterLabel = report.quarter || "N/A";
                                    const isOpen = openQuarter === quarterLabel;

                                    const parseNumeric = (str: string) => parseFloat(str.replace(/[^0-9.-]/g, ''));

                                    const epsActStr = String(parsed.actual_eps || "0");
                                    const epsEstStr = String(parsed.est_eps || "0");
                                    const epsActNum = parseNumeric(epsActStr);
                                    const epsEstNum = parseNumeric(epsEstStr);
                                    const epsBeat = (!isNaN(epsActNum) && !isNaN(epsEstNum)) ? epsActNum >= epsEstNum : epsActStr >= epsEstStr;

                                    const revActStr = String(parsed.actual_rev || "0");
                                    const revEstStr = String(parsed.est_rev || "0");
                                    const revActNum = parseNumeric(revActStr);
                                    const revEstNum = parseNumeric(revEstStr);
                                    const revBeat = (!isNaN(revActNum) && !isNaN(revEstNum)) ? revActNum >= revEstNum : revActStr >= revEstStr;

                                    const isKoreanStock = /^\\d+$/.test(ticker) || ticker.includes('.KS') || ticker.includes('.KQ') || /[가-힣]/.test(ticker);
                                    const epsLabel = isKoreanStock ? "실제 영업이익 (OP)" : "실제 주당순이익 (EPS)";

                                    const formatCurrency = (val: string) => val.includes('원') || val.includes('₩') || val.includes('$') || val.includes('조') || val.includes('억') ? val : `₩${val}`;

                                    return (
                                        <div key={report.id} className="border border-toss-border rounded-2xl overflow-hidden bg-toss-card transition-all">
                                            {/* Accordion Header */}
                                            <button
                                                onClick={() => setOpenQuarter(isOpen ? "" : quarterLabel)}
                                                className="w-full p-6 flex items-center justify-between bg-zinc-900 border-b border-toss-border/0 hover:bg-zinc-800 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <h4 className="text-xl font-black text-white">{quarterLabel}</h4>
                                                    <div className="flex gap-2">
                                                        {epsBeat && revBeat ? (
                                                            <span className="px-2 py-1 bg-toss-red/10 text-toss-red border border-toss-red/20 rounded text-xs font-bold uppercase tracking-wider">어닝 서프라이즈</span>
                                                        ) : !epsBeat && !revBeat ? (
                                                            <span className="px-2 py-1 bg-toss-blue/10 text-toss-blue border border-toss-blue/20 rounded text-xs font-bold uppercase tracking-wider">어닝 쇼크</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs font-bold uppercase tracking-wider">혼조세</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            {/* Accordion Body */}
                                            {isOpen && (
                                                <div className="p-6 bg-[#0a0a0a] border-t border-toss-border animate-in slide-in-from-top-2 duration-200">
                                                    {/* Wall Street Metrics */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-toss-border">
                                                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center justify-between">
                                                                {epsLabel}
                                                                {epsBeat ? <CheckCircle className="w-3 h-3 text-toss-red" /> : <XCircle className="w-3 h-3 text-toss-blue" />}
                                                            </p>
                                                            <p className={`text-2xl  font-bold ${epsBeat ? 'text-toss-red' : 'text-toss-blue'}`}>{formatCurrency(epsActStr)}</p>
                                                            <p className="text-xs text-zinc-600 mt-1">예측치: {formatCurrency(epsEstStr)}</p>
                                                        </div>
                                                        <div className="bg-zinc-900 p-4 rounded-2xl border border-toss-border">
                                                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center justify-between">
                                                                실제 매출 (Rev)
                                                                {revBeat ? <CheckCircle className="w-3 h-3 text-toss-red" /> : <XCircle className="w-3 h-3 text-toss-blue" />}
                                                            </p>
                                                            <p className={`text-2xl  font-bold ${revBeat ? 'text-toss-red' : 'text-toss-blue'}`}>{formatCurrency(revActStr)}</p>
                                                            <p className="text-xs text-zinc-600 mt-1">예측치: {formatCurrency(revEstStr)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Forward Guidance & AI Interpretation */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">기업 미래 가이던스</h5>
                                                            <p className="text-zinc-400 text-sm leading-relaxed bg-zinc-900/50 p-4 rounded-2xl border border-toss-border border-l-4 border-l-toss-blue italic">
                                                                &quot;{parsed.guidance_summary}&quot;
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                <BrainCircuit className="w-4 h-4" />
                                                                AI 투자 해석
                                                            </h5>
                                                            <p className="text-indigo-100 text-sm leading-relaxed bg-indigo-950/20 p-4 rounded-2xl border border-indigo-900/50 relative overflow-hidden flex flex-col justify-between h-full">
                                                                <span className="relative z-10">{parsed.ai_interpretation}</span>
                                                                <span className="relative z-10 w-fit mt-4 px-2 py-1 border border-indigo-500/50 bg-indigo-500/10 text-indigo-400 text-xs  font-bold uppercase rounded">
                                                                    AI 최종 판정: {(parsed.verdict || report.verdict) === 'BUY' ? '매수' : (parsed.verdict || report.verdict) === 'SELL' ? '매도' : '보유'}
                                                                </span>
                                                                <span className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
