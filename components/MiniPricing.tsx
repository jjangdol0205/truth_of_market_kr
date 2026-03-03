import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function MiniPricing() {
    return (
        <section className="mt-24 mb-10">
            <div className="max-w-3xl mx-auto bg-gradient-to-b from-zinc-900 to-black border border-toss-border rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">감으로 하는 투자는 이제 그만.</h3>
                <p className="text-zinc-400 mb-8 max-w-xl mx-auto text-lg">
                    스마트 머니(기관/외국인)는 이미 월스트리트 수준의 데이터를 활용하고 있습니다. 커피 한 잔 값으로 똑같은 무기를 장착하세요.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>결제 즉시 열람</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>위약금 없이 해지</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>무제한 심층 리포트</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all">
                        일일 이용권 (₩9,900)
                    </Link>
                    <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105">
                        PRO 멤버십 가입 (추천)
                    </Link>
                </div>
            </div>
        </section>
    );
}
