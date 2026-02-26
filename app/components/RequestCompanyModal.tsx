"use client";

import { useState } from "react";
import { X, Loader2, Send, CheckCircle2 } from "lucide-react";

interface RequestCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestCompanyModal({ isOpen, onClose }: RequestCompanyModalProps) {
    const [companyName, setCompanyName] = useState("");
    const [ticker, setTicker] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        if (!companyName.trim()) {
            setErrorMsg("Company Name is required.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, ticker }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request.");
            }

            setSuccess(true);

            // clear form
            setCompanyName("");
            setTicker("");

        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setErrorMsg("");
        setCompanyName("");
        setTicker("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-toss-card/80 backdrop-blur-md p-4">
            <div className="bg-toss-card border border-toss-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-toss-blue to-indigo-600"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-toss-blue/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8 text-toss-blue" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">분석 요청이 접수되었습니다!</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                                감사합니다. AI 에이전트가 해당 기업의 분석을 최우선으로 진행할 예정입니다.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-2xl transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-black text-white tracking-tight mb-2">기업 분석 요청하기</h2>
                                <p className="text-zinc-400 text-sm font-medium">특정 기업에 대한 심층 분석이 필요하신가요?</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        기업명 입력 *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="예: Samsung, AAPL, 005930.KS"
                                        className="w-full bg-toss-card border border-toss-border rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-toss-blue focus:ring-1 focus:ring-toss-blue transition-all placeholder:text-zinc-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        추가 코멘트 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        value={ticker}
                                        onChange={(e) => setTicker(e.target.value)}
                                        placeholder="요청 사유 등"
                                        className="w-full bg-toss-card border border-toss-border rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-toss-blue focus:ring-1 focus:ring-toss-blue transition-all placeholder:text-zinc-600"
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="bg-toss-red/10 border border-toss-red/50 text-toss-red text-sm p-3 rounded-2xl text-center">
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !companyName.trim()}
                                    className="w-full bg-white text-black font-bold py-3.5 mt-4 rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            요청 제출 <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
