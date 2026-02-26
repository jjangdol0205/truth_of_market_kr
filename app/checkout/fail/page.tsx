"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";

export default function FailPage({ searchParams }: { searchParams: { code: string, message: string, orderId: string } }) {
    const { code, message, orderId } = searchParams;

    return (
        <div className="max-w-md mx-auto my-24 p-8 bg-toss-card border border-rose-500/30 rounded-3xl shadow-2xl text-center">
            <div className="py-8">
                <XCircle className="w-16 h-16 text-toss-red mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">결제 실패</h2>
                <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 mb-8 text-left text-sm">
                    <p className="text-zinc-400 mb-2"><strong>오류 메시지:</strong> <span className="text-toss-red">{message || "알 수 없는 오류"}</span></p>
                    <p className="text-zinc-400 mb-2"><strong>오류 코드:</strong> {code || "N/A"}</p>
                    {orderId && <p className="text-zinc-400"><strong>주문 번호:</strong> {orderId}</p>}
                </div>
                <Link href="/checkout" className="bg-toss-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors">
                    다른 수단으로 결제하기
                </Link>
            </div>
        </div>
    );
}
