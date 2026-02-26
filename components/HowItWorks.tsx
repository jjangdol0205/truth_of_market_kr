import { Shield, Brain, Zap } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="mb-20 pb-10 border-b border-zinc-900">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-white mb-4">어떻게 작동하나요?</h3>
                <p className="text-zinc-400">월스트리트 기관 수준의 심층 리서치를 AI가 가장 쉽고 빠르게 제공합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-[40px] left-[15%] w-[70%] h-0.5 bg-gradient-to-r from-zinc-800 via-emerald-500/20 to-zinc-800 -z-10"></div>

                {/* Step 1 */}
                <div className="bg-toss-card border border-toss-border p-8 rounded-3xl text-center relative hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-zinc-900 border border-toss-border text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4  font-bold text-6xl text-zinc-900/50 pointer-events-none">1</div>
                    <h4 className="text-xl font-bold text-white mb-3">데이터 수집</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        개인 투자자가 놓치기 쉬운 수만 개의 전자공시(DART), 재무제표, 실시간 수급 동향, 내부자 거래 내역을 실시간으로 스캔합니다.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-toss-card border border-toss-border p-8 rounded-3xl text-center relative hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] relative z-10">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4  font-bold text-6xl text-zinc-900/50 pointer-events-none">2</div>
                    <h4 className="text-xl font-bold text-white mb-3">AI 데이터 처리</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        전문 기관 트레이더의 로직을 학습한 AI가 원시 기본적 분석 데이터를 바탕으로 엘리어트 파동, 이동평균선 등 기술적 차트 구조와 교차 검증합니다.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-toss-card border border-toss-border p-8 rounded-3xl text-center relative hover:border-amber-500/50 transition-colors">
                    <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] relative z-10">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4  font-bold text-6xl text-zinc-900/50 pointer-events-none">3</div>
                    <h4 className="text-xl font-bold text-white mb-3">즉각적인 결과 도출</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        복잡한 미사여구는 빼고, 긍정적인 상승 관점과 부정적인 하락 관점을 모두 포함한 객관적인 평가(매수/매도 판정)를 단 10초 안에 전달합니다.
                    </p>
                </div>
            </div>
        </section>
    );
}
