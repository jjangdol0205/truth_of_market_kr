import { createClient } from "../../utils/supabase/server";
import { Calendar } from "lucide-react";
import BriefingList from "../components/BriefingList";

export const revalidate = 60; // Cache the page for 60 seconds

export default async function BriefingsPage() {
    const supabase = await createClient();

    // Fetch all market summaries ordered by date descending
    const { data: briefings, error } = await supabase
        .from('market_summaries')
        .select('id, date, created_at, title, content')
        .order('date', { ascending: false });

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-toss-blue/30 overflow-x-hidden pt-16">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30vh] h-[30vh] bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center space-x-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span>Daily Archive</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        일일 시황 브리핑
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        매일 마감 직후 AI가 정리하는 KOSPI / KOSDAQ 및 글로벌 시장의 핵심 동인과 투자 전망을 확인하세요.
                    </p>
                </div>

                <div className="space-y-12">
                    {error ? (
                        <div className="p-12 text-center text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                            브리핑 데이터를 불러오는 데 실패했습니다.
                        </div>
                    ) : briefings?.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 bg-zinc-900 border border-toss-border rounded-2xl">
                            등록된 브리핑이 없습니다.
                        </div>
                    ) : (
                        <BriefingList briefings={briefings || []} />
                    )}
                </div>
            </div>
        </main>
    );
}
