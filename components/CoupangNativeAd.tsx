"use client";

import React from 'react';

export default function CoupangNativeAd({ ticker }: { ticker?: string }) {
    return (
        <div className="w-full my-8 bg-gradient-to-r from-[#18181b] to-[#0a0a0a] rounded-2xl p-6 border border-zinc-800 hover:border-rose-500/40 transition-all shadow-xl group">
            <h4 className="text-rose-500 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl animate-bounce">💡</span>
                AI 추천: 성공하는 투자자들의 데스크 셋업 & 필독서
            </h4>
            <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                변동성 장세에서도 흔들리지 않는 수익률! {ticker ? `${ticker} 주주들이` : '주식 고수들이'} 가장 많이 구매한 
                <strong> 와이드 모니터</strong>와 <strong>베스트셀러 투자 도서</strong>를 확인해보세요.
            </p>
            <a 
                href="https://link.coupang.com/a/ewWHT2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-6 py-3 rounded-xl font-bold transition-all w-full sm:w-auto"
            >
                🔥 주식 트레이더 잇템(It-item) 구경하기
            </a>
            <p className="mt-5 text-[10px] text-zinc-600 font-mono">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
}
