"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage({ searchParams }: { searchParams: { orderId: string, paymentKey: string, amount: string } }) {
    const { orderId, paymentKey, amount } = searchParams;
    const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // We must verify the transaction with our backend to finalize it securely
        const verifyPayment = async () => {
            if (!orderId || !paymentKey || !amount) {
                setStatus("failed");
                setErrorMessage("Missing payment parameters.");
                return;
            }

            try {
                const res = await fetch("/api/toss/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, paymentKey, amount }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus("success");
                } else {
                    setStatus("failed");
                    setErrorMessage(data.message || "결제 승인 과정에서 오류가 발생했습니다.");
                }
            } catch (err) {
                setStatus("failed");
                setErrorMessage("네트워크 오류가 발생했습니다.");
            }
        };

        verifyPayment();
    }, [orderId, paymentKey, amount]);

    return (
        <div className="max-w-md mx-auto my-24 p-8 bg-toss-card border border-toss-border rounded-3xl shadow-2xl text-center">
            {status === "verifying" && (
                <div className="py-12">
                    <Loader2 className="w-16 h-16 animate-spin text-toss-blue mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">결제 승인 중...</h2>
                    <p className="text-zinc-400">안전하게 결제 내역을 확인하고 있습니다.</p>
                </div>
            )}

            {status === "success" && (
                <div className="py-12 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="w-16 h-16 text-toss-blue mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">결제 성공!</h2>
                    <p className="text-zinc-300 mb-8">
                        주문번호 <strong>{orderId}</strong>에 대한 결제 ({parseInt(amount || "0").toLocaleString()}원)가
                        안전하게 처리되었습니다.
                    </p>
                    <Link href="/" className="bg-toss-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors">
                        홈으로 돌아가기
                    </Link>
                </div>
            )}

            {status === "failed" && (
                <div className="py-12 animate-in fade-in zoom-in duration-500">
                    <XCircle className="w-16 h-16 text-toss-red mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">승인 실패</h2>
                    <p className="text-zinc-300 mb-8 text-sm">{errorMessage}</p>
                    <Link href="/checkout" className="bg-zinc-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-zinc-700 transition-colors">
                        다시 시도하기
                    </Link>
                </div>
            )}
        </div>
    );
}
