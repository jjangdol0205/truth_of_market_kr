"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, ExternalLink, X, Loader2 } from "lucide-react";

interface Product {
    productId: number;
    productName: string;
    productPrice: number;
    productImage: string;
    productUrl: string;
}

export default function UnlockInterstitialAd({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check local storage for unlock status (24 hours)
        const unlockTime = localStorage.getItem('truth_of_market_unlocked');
        if (unlockTime) {
            const timeDiff = new Date().getTime() - parseInt(unlockTime);
            if (timeDiff < 24 * 60 * 60 * 1000) {
                setIsUnlocked(true);
            } else {
                localStorage.removeItem('truth_of_market_unlocked');
            }
        }
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch 3 random but relevant items
            const keywords = ["주식 투자 베스트셀러", "차트 듀얼 모니터", "맥북 프로"];
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            const res = await fetch(`/api/coupang?keyword=${encodeURIComponent(randomKeyword)}&limit=3`);
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.productData) {
                    setProducts(data.data.productData);
                }
            }
        } catch (error) {
            console.error("Failed to load products", error);
        }
        setLoading(false);
    };

    const handleUnlockClick = () => {
        setShowModal(true);
        if (products.length === 0) {
            fetchProducts();
        }
    };

    const handleSponsorClick = (url: string) => {
        // Mark as unlocked
        localStorage.setItem('truth_of_market_unlocked', new Date().getTime().toString());
        setIsUnlocked(true);
        setShowModal(false);
        // Open sponsor link
        window.open(url, '_blank');
    };

    // If already unlocked, just render children cleanly
    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative mt-8">
            {/* Blurred Content */}
            <div className="select-none pointer-events-none blur-[8px] opacity-40 transition-all duration-700">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
                <div className="bg-[#18181b]/90 backdrop-blur-xl border border-zinc-700 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-toss-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-toss-red" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">
                        프리미엄 리포트 잠금 해제
                    </h3>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        아래 버튼을 눌러 스폰서를 방문해 주시면,<br />
                        <strong className="text-white">심층 AI 분석 리포트 전문이 24시간 동안 전면 무료로 개방</strong>됩니다.
                    </p>
                    <button
                        onClick={handleUnlockClick}
                        className="w-full bg-toss-red hover:bg-toss-red/90 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-3 text-lg"
                    >
                        <Unlock className="w-5 h-5" />
                        전문 무료로 읽기 (스폰서 방문)
                    </button>
                </div>
            </div>

            {/* Full Screen Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#18181A] border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="p-8 pb-4 border-b border-zinc-800 text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">스폰서 방문 후 즉시 열람</h2>
                            <p className="text-zinc-400 text-sm md:text-base">
                                아래 스폰서 상품 중 하나를 클릭하시면 즉시 블러 처리가 해제되며 리포트 전문을 확인하실 수 있습니다.
                            </p>
                        </div>

                        <div className="p-6 md:p-8">
                            <h4 className="text-toss-blue font-bold text-sm mb-4">📈 주식 투자자를 위한 추천 상품</h4>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <p>추천 상품을 불러오는 중입니다...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {products.map((product) => (
                                        <div 
                                            key={product.productId} 
                                            onClick={() => handleSponsorClick(product.productUrl)}
                                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-toss-blue/50 hover:bg-zinc-800 transition-all group"
                                        >
                                            <div className="aspect-square bg-white rounded-xl mb-4 overflow-hidden relative">
                                                <img 
                                                    src={product.productImage} 
                                                    alt={product.productName} 
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <h5 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-toss-blue transition-colors">
                                                {product.productName}
                                            </h5>
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-toss-red font-bold">
                                                    {product.productPrice.toLocaleString()}원
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-toss-blue" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                    <p className="mb-6">현재 스폰서 상품을 불러올 수 없습니다.</p>
                                    <button 
                                        onClick={() => {
                                            localStorage.setItem('truth_of_market_unlocked', new Date().getTime().toString());
                                            setIsUnlocked(true);
                                            setShowModal(false);
                                        }}
                                        className="bg-toss-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-toss-blue/90 shadow-lg"
                                    >
                                        바로 열람하기 (광고 패스)
                                    </button>
                                </div>
                            )}
                            
                            {products.length > 0 && (
                                <p className="text-xs text-zinc-600 mt-6 text-center">
                                    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
