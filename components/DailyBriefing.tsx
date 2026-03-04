import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Play, Volume2, Clock } from 'lucide-react';

interface DailyBriefingProps {
    summary: {
        date: string;
        title: string;
        content: string;
    } | null;
}

export default function DailyBriefing({ summary }: DailyBriefingProps) {
    if (!summary) return null;

    return (
        <section className="mb-20">
            <h3 className="text-2xl font-bold text-white flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xl">🌎</span> Daily Market Briefing <span className="text-xs bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold ml-2 animate-pulse whitespace-nowrap">오늘 무료 공개</span>
            </h3>
            <div className="bg-[#18181A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-toss-green/20 rounded-full blur-[80px] group-hover:bg-toss-green/30 transition-all duration-700"></div>

                {/* Audio Player Bar (Mock) */}
                <div className="mb-8 flex flex-col md:flex-row items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 shadow-inner">
                    <button className="flex-shrink-0 w-12 h-12 rounded-full bg-toss-green text-black flex items-center justify-center hover:scale-105 hover:shadow-[0_0_20px_rgba(49,209,104,0.4)] transition-all">
                        <Play size={20} className="ml-1" fill="currentColor" />
                    </button>
                    <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400 font-medium">
                            <span>오늘의 시장 요약 브리핑 듣기</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> 03:45</span>
                        </div>
                        {/* Mock Waveform */}
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex items-center gap-1 px-1">
                            {[...Array(30)].map((_, i) => (
                                <div key={i} className={`h-full w-1 rounded-full bg-toss-green/30 animate-pulse`} style={{ animationDelay: `${i * 0.1}s`, height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <button className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Volume2 size={18} />
                    </button>
                </div>

                <h4 className="text-2xl font-extrabold text-white mb-6 tracking-tight relative z-10">
                    {summary.title}
                </h4>

                <div className="prose prose-invert prose-emerald prose-sm md:prose-base max-w-none 
                    prose-p:leading-relaxed prose-p:text-zinc-300 
                    prose-headings:text-white prose-headings:font-bold
                    prose-strong:text-toss-green prose-strong:bg-toss-green/10 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded-md prose-strong:font-bold
                    prose-li:text-zinc-300 relative z-10">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {summary.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-6 pt-4 border-t border-toss-border flex justify-between items-center text-xs  text-zinc-500 relative z-10">
                    <span className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-toss-green mr-2 animate-pulse"></span>
                        AI 생성 리포트
                    </span>
                    <span>{summary.date}</span>
                </div>
            </div>
        </section>
    );
}
