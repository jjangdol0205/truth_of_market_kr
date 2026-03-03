import { TrendingUp, Award, Users } from "lucide-react";

export default function SocialProof() {
    return (
        <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900/50 border border-toss-border p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">87.4%</div>
                        <div className="text-xs text-zinc-500 ">투자 예측 적중률 (2025년 3분기)</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-toss-border p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">1,000만+</div>
                        <div className="text-xs text-zinc-500 ">분석된 재무 데이터 포인트</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-toss-border p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-toss-blue/10 p-3 rounded-2xl text-toss-blue">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">4,200+</div>
                        <div className="text-xs text-zinc-500 ">활성 프로 트레이더</div>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🎯</span> 최근 AI 적중 사례
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-toss-card border border-toss-border p-6 rounded-3xl hover:border-toss-red/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">SK하이닉스</span>
                            <span className="bg-toss-red/20 text-toss-red text-xs px-2 py-1 rounded font-bold">매수 추천</span>
                        </div>
                        <span className="text-toss-red font-bold">+18.4%</span>
                    </div>
                    <p className="text-sm text-zinc-400 italic">"외국인/기관의 대규모 매집 포착 48시간 전. 개인 투자자들은 해당 수급을 전혀 인지하지 못했습니다."</p>
                    <div className="mt-4 text-xs text-zinc-600 ">생성일: 3일 전</div>
                </div>

                <div className="bg-toss-card border border-toss-border p-6 rounded-3xl hover:border-toss-blue/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">NAVER</span>
                            <span className="bg-toss-blue/20 text-toss-blue text-xs px-2 py-1 rounded font-bold">매도 추천</span>
                        </div>
                        <span className="text-toss-blue font-bold">-12.1%</span>
                    </div>
                    <p className="text-sm text-zinc-400 italic">"실적 발표 중 경영진이 언급을 피했던 재무제표 주석 내 심각한 재고 누적 및 비용 증가 리스크를 AI가 사전에 경고했습니다."</p>
                    <div className="mt-4 text-xs text-zinc-600 ">생성일: 1주일 전</div>
                </div>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-6">* 과거의 성과가 미래의 수익을 보장하지 않습니다. 본 리포트는 투자 권유가 아닙니다.</p>
        </section>
    );
}
