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
                <input
                    type="text"
                    placeholder="기업명 검색 (예: 삼성전자, 카카오)"
                    className="w-full bg-[#18181a]/80 backdrop-blur-md border border-white/5 rounded-3xl py-5 pl-8 pr-16 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-toss-blue/50 focus:border-toss-blue/50 transition-all text-lg shadow-sm hover:border-white/10"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-3 top-3 bottom-3 bg-toss-blue hover:bg-blue-500 text-white p-2 rounded-2xl transition-all flex items-center justify-center w-12 shadow-[0_0_15px_rgba(49,130,246,0.3)] hover:shadow-[0_0_20px_rgba(49,130,246,0.6)]"
                >
                    <Search className="w-5 h-5 font-bold" />
                </button>
            </form>


        </div>
    );
}
