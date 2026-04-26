"use client";

import Link from "next/link";

export default function TopNav() {

    return (
        <>
            <header className="border-b border-toss-border py-4 px-6 flex justify-between items-center bg-[#0a0a0a]">
                <Link href="/" className="text-xl font-bold tracking-tighter text-toss-red hover:opacity-80 transition-opacity">
                    TRUTH_OF_MARKET<span className="animate-pulse">_</span>
                </Link>
                <nav className="flex items-center text-sm text-gray-400 font-medium  gap-6">
                    <Link href="/" className="cursor-pointer hover:text-white transition-colors hidden md:inline">분석 리포트</Link>
                    <Link href="/briefings" className="cursor-pointer hover:text-white transition-colors hidden md:inline">일일 시황</Link>
                    <Link href="/about" className="cursor-pointer hover:text-white transition-colors hidden md:inline">소개</Link>
                    <a 
                        href="https://influencers.coupang.com/s/paradisehero" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="cursor-pointer hover:text-toss-red transition-colors hidden md:inline flex items-center gap-1 font-bold"
                    >
                        🎁 투자 장비 샵
                    </a>

                    <div className="w-px h-4 bg-zinc-700 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-bold hidden sm:inline"
                        >
                            Admin
                        </Link>
                    </div>
                </nav>
            </header>
        </>
    );
}
