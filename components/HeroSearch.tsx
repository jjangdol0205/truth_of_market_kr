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
            <form onSubmit={handleSearch} className="w-full relative shadow-2xl">
                <input
                    type="text"
                    placeholder="종목명 또는 심볼 검색 (예: 005930, TSLA)"
                    className="w-full bg-toss-card border-none rounded-full py-4 pl-6 pr-14 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-toss-blue transition-all text-lg uppercase shadow-sm"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    maxLength={6}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-toss-blue hover:bg-blue-600 text-white p-2 rounded-full transition-all flex items-center justify-center w-12"
                >
                    <Search className="w-5 h-5 font-bold" />
                </button>
            </form>


        </div>
    );
}
