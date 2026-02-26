import { Shield, BrainCircuit, LineChart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 mb-20">

            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[600px] bg-toss-red/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-800">
                        MarketTruth 소개
                    </h1>
                    <p className="text-xl md:text-2xl text-red-400  tracking-tight uppercase font-bold">
                        기관급 정밀 분석 시스템
                    </p>
                </div>

                {/* Core Message */}
                <div className="bg-toss-card/40 border border-toss-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-sm text-left relative overflow-hidden group hover:border-toss-red/50 transition-colors duration-500">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-toss-red to-red-900 group-hover:w-2 transition-all duration-300"></div>

                    <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
                        MarketTruth는 인간의 편향과 감정적 거래를 배제하고 글로벌 주식에 대한 심층적인 알고리즘 기반 통찰력을 제공합니다. 펀더멘탈, 기술적 트렌드, 기관 수급을 분석하여 시장의 진정한 가치를 밝혀냅니다.
                    </p>
                    <p className="mt-6 text-zinc-500  text-sm leading-relaxed">
                        감정이 아닌 순수한 데이터만을 요구하는 전문 트레이더, 헤지 펀드, 그리고 진지한 개인 투자자들을 위해 설계되었습니다. 강력한 다중 에이전트 AI 프레임워크가 SEC 공시, 실적 발표 스크립트, 실시간 체결 데이터를 해부하여 통합적인 <span className="text-red-400 font-bold">Risk Score (투자 위험 지수)</span>를 생성합니다.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-toss-border hover:bg-zinc-900 transition-colors">
                        <BrainCircuit className="w-8 h-8 text-toss-red mb-4" />
                        <h3 className="text-white font-bold mb-2  uppercase tracking-wider">AI Precision</h3>
                        <p className="text-sm text-zinc-500">노이즈 속에서 숨겨진 알파를 추출하는 냉철한 멀티모달 LLM 연산 체계.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-toss-border hover:bg-zinc-900 transition-colors">
                        <LineChart className="w-8 h-8 text-toss-red mb-4" />
                        <h3 className="text-white font-bold mb-2  uppercase tracking-wider">Smart Money</h3>
                        <p className="text-sm text-zinc-500">기관의 매집과 분산 단계를 포착하는 고급 기술적 분석 추적 시스템.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-toss-border hover:bg-zinc-900 transition-colors">
                        <Shield className="w-8 h-8 text-toss-red mb-4" />
                        <h3 className="text-white font-bold mb-2  uppercase tracking-wider">Risk Assesment</h3>
                        <p className="text-sm text-zinc-500">현재의 가치 평가 대비 펀더멘탈 건전성을 따져 산출하는 0-100점 척도의 엄격한 위험도 스코어링.</p>
                    </div>
                </div>

                {/* CTA - removed since there's no pro version anymore */}
                <div className="pt-12">
                </div>

            </div>
        </div>
    );
}
