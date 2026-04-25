"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingShopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show button after a slight delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <a
            href="https://influencers.coupang.com/s/paradisehero"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center group"
            title="파라다이스 히어로 추천 아이템"
        >
            <div className="absolute inset-0 bg-rose-500 rounded-full blur opacity-30 group-hover:opacity-70 group-hover:blur-md transition-all duration-300"></div>
            <div className="relative bg-[#050505] border border-rose-500/40 text-white shadow-2xl rounded-full p-3.5 flex items-center gap-2 transform group-hover:scale-105 transition-all duration-300 overflow-hidden">
                <ShoppingBag className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="font-bold whitespace-nowrap hidden sm:inline text-xs tracking-tight text-zinc-200">
                    추천 아이템 구경하기
                </span>
                
                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
            </div>
        </a>
    );
}
