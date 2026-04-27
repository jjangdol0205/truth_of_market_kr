"use client";
import Link from "next/link";
import React from "react";
import CompanyLogo from "./CompanyLogo";

interface StockCardProps {
    ticker: string;
    name: string;
    price: string | number;
    changePercent: number;
    isFreeSample?: boolean;
    country?: 'US' | 'KR';
}

export default function StockCard({ ticker, name, price, changePercent, isFreeSample, country = 'US' }: StockCardProps) {
    const isPositive = changePercent >= 0;
    const colorClass = isPositive ? "text-toss-green" : "text-toss-red";
    const sign = isPositive ? "+" : "";

    return (
        <Link href={`/hub/${ticker}`}>
            <div className="bg-[#18181A]/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex justify-between items-center group relative overflow-hidden">
                {/* Subtle gradient glow inside card on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <CompanyLogo
                        ticker={ticker}
                        className="w-12 h-12 rounded-full object-contain bg-white/10 backdrop-blur-md p-1 shrink-0 border border-white/10"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg tracking-tight transition-colors">
                                {name} {country === 'US' ? '🇺🇸' : '🇰🇷'}
                            </h3>
                            {isFreeSample && (
                                <span className="bg-toss-blue/20 text-toss-blue border border-toss-blue/30 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-tight whitespace-nowrap">
                                    무료 리포트
                                </span>
                            )}
                        </div>
                        {ticker !== name && <p className="text-zinc-500 text-sm font-medium">{ticker}</p>}
                    </div>
                </div>

                <div className="text-right relative z-10">
                    <p className="text-xl font-bold text-white tracking-tight">
                        {typeof price === 'number' ? (country === 'US' ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `₩${price.toLocaleString('ko-KR')}`) : price}
                    </p>
                    <p className={`text-sm font-bold ${colorClass} tracking-tight`}>
                        {sign}{typeof changePercent === 'number' ? changePercent.toFixed(2) : changePercent}%
                    </p>
                </div>
            </div>
        </Link>
    );
}
