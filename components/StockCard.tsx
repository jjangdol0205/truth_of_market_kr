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
}

export default function StockCard({ ticker, name, price, changePercent, isFreeSample }: StockCardProps) {
    const isPositive = changePercent >= 0;
    const colorClass = isPositive ? "text-toss-red" : "text-toss-blue";
    const sign = isPositive ? "+" : "";

    return (
        <Link href={`/hub/${ticker}`}>
            <div className="bg-toss-card rounded-2xl p-5 hover:scale-105 transition-transform duration-300 cursor-pointer flex justify-between items-center group">
                <div className="flex items-center gap-4">
                    <CompanyLogo
                        ticker={ticker}
                        className="w-12 h-12 rounded-full object-contain bg-white p-1 shrink-0"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg tracking-tight transition-colors">
                                {name}
                            </h3>
                            {isFreeSample && (
                                <span className="bg-toss-blue/10 text-toss-blue text-[10px] font-bold px-2 py-0.5 rounded-full tracking-tight whitespace-nowrap">
                                    무료 체험
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-500  text-sm">{ticker}</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className=" text-xl font-bold text-white">{typeof price === 'number' ? `₩${price.toLocaleString('ko-KR')}` : price}</p>
                    <p className={` text-sm font-medium ${colorClass}`}>
                        {sign}{typeof changePercent === 'number' ? changePercent.toFixed(2) : changePercent}%
                    </p>
                </div>
            </div>
        </Link>
    );
}
