"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import AuthModal from "./AuthModal";
import RequestCompanyModal from "./RequestCompanyModal";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function TopNav() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const supabase = createClient();



    useEffect(() => {
        // Automatically open modal if redirected from checkout
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('login') === 'true') {
                setIsAuthModalOpen(true);
            }
        }
    }, []);

    useEffect(() => {
        // Initialize active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
        });

        // Listen for Auth changes globally
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                setIsAuthModalOpen(false); // Make sure modal closes if logging in via magic link/other windows
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

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

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-300 hidden sm:inline" title={user.email}>
                                {user.email?.split("@")[0]}
                            </span>
                            {user.email === "beable9489@gmail.com" && (
                                <Link
                                    href="/admin"
                                    className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-bold"
                                >
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="text-zinc-400 hover:text-white transition-colors text-sm font-bold"
                            >
                                분석 요청
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 px-3 py-1 rounded transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="bg-white text-black font-bold px-4 py-1.5 rounded hover:bg-zinc-200 transition-colors"
                        >
                            로그인
                        </button>
                    )}
                </nav>
            </header>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <RequestCompanyModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
            />
        </>
    );
}
