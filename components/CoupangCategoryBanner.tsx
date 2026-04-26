"use client";

import React from 'react';

export default function CoupangCategoryBanner() {
    return (
        <div className="w-full flex justify-center my-8 overflow-hidden">
            <a 
                href="https://link.coupang.com/a/ewWHT2" 
                target="_blank" 
                rel="noopener noreferrer"
                referrerPolicy="unsafe-url"
                className="inline-block transition-transform hover:scale-[1.02] duration-300"
            >
                <img 
                    src="https://ads-partners.coupang.com/banners/800448?subId=&traceId=V0-301-879dd1202e5c73b2-I800448&w=728&h=90" 
                    alt="추천 상품 카테고리" 
                    className="max-w-full h-auto rounded-xl shadow-lg border border-zinc-800/50"
                />
            </a>
        </div>
    );
}
