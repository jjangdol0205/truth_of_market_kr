"use client";

import React from 'react';
import { Gift } from 'lucide-react';

export default function StickyMobileAd() {
    return (
        <div className="fixed bottom-0 left-0 w-full z-40 sm:hidden bg-gradient-to-r from-[#18181b] to-[#0a0a0a] border-t border-rose-500/30 p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <a 
                href="https://link.coupang.com/a/ewWHT2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-3 transition-colors active:scale-95"
            >
                <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 animate-bounce" />
                    <span className="text-sm font-bold tracking-tight">
                        실시간 경제 베스트셀러 특가
                    </span>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">
                    확인하기 ➡️
                </span>
            </a>
            <div className="w-full text-center mt-1">
                <span className="text-[8px] text-zinc-600">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
            </div>
        </div>
    );
}
