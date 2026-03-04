"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSearch() {
    const [ticker, setTicker] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticker.trim()) {
            router.push(`/hub/${ticker.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-8 flex flex-col items-center gap-4">
            <form onSubmit={handleSearch} className="w-full relative shadow-2xl group">
                {/* Glowing subtle ring behind input for premium feel */}
                <div className="absolute inset-0 bg-toss-blue/20 rounded-3xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <input
                    type="text"
                    placeholder="기업명 검색 (예: 삼성전자, 테슬라)"
                    className="w-full relative bg-[#18181A]/60 backdrop-blur-xl border border-white/10 rounded-3xl py-5 pl-8 pr-16 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-toss-blue focus:border-toss-blue transition-all duration-300 text-lg shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:bg-[#18181A]/80 z-10"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-3 top-3 bottom-3 bg-toss-blue hover:bg-[#0066eb] text-white p-2 rounded-2xl transition-all duration-300 flex items-center justify-center w-12 shadow-[0_0_15px_rgba(0,119,255,0.4)] hover:shadow-[0_0_25px_rgba(0,119,255,0.7)] hover:-translate-y-0.5 z-20"
                >
                    <Search className="w-5 h-5 font-bold" />
                </button>
            </form>
        </div>
    );
}
