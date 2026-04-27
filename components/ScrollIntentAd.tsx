"use client";

import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';

export default function ScrollIntentAd() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (hasDismissed) return;
            
            // Show when scrolled down roughly 800px
            if (window.scrollY > 800 && !isVisible) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isVisible, hasDismissed]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-6 sm:bottom-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 max-w-sm">
            <div className="bg-[#18181A]/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl shadow-2xl p-5 relative overflow-hidden group">
                {/* Close Button */}
                <button 
                    onClick={() => {
                        setIsVisible(false);
                        setHasDismissed(true);
                    }}
                    className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                        <BookOpen className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">
                            워런 버핏의 5시간 법칙 💡
                        </h4>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                            최고의 투자는 자신에 대한 투자입니다. 지금 주식 고수들이 가장 많이 읽고 있는 베스트셀러를 확인해보세요.
                        </p>
                        <a 
                            href="https://link.coupang.com/a/ewWHT2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors w-full text-center"
                        >
                            투자/경제 도서 순위 보기
                        </a>
                        <p className="mt-2 text-[8px] text-zinc-600 text-center">쿠팡 파트너스 활동 수수료 제공</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
