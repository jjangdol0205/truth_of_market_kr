"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Use the client key from env, fallback to public test key
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function CheckoutPage() {
    const router = useRouter();
    const [amount, setAmount] = useState({ currency: "KRW", value: 15000 });
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);

    const paymentWidgetRef = useRef<any>(null);

    useEffect(() => {
        const renderPaymentWidgets = async () => {
            try {
                // Initialize TossPayments
                const tossPayments = await loadTossPayments(clientKey);

                // Create a dynamic, unique customerKey for anonymous checkout
                const customerKey = `anon_${Math.random().toString(36).substring(2, 10)}`;

                // Get widgets instance
                const widgetsInstance = tossPayments.widgets({ customerKey });
                setWidgets(widgetsInstance);

                // Initialize the Payment Method specific widget and Terms widget
                await widgetsInstance.setAmount(amount);

                // Render Payment Method selection
                paymentWidgetRef.current = await widgetsInstance.renderPaymentMethods({
                    selector: "#payment-method",
                    variantKey: "DEFAULT",
                });

                // Render Agreement Terms
                await widgetsInstance.renderAgreement({
                    selector: "#agreement",
                    variantKey: "AGREEMENT",
                });

                setReady(true);
            } catch (error) {
                console.error("Error rendering payment widget:", error);
            }
        };

        renderPaymentWidgets();
    }, [amount]);

    const handlePayment = async () => {
        if (!widgets) return;

        try {
            // Setup an orderId that we can use to verify on the backend later
            const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;

            // Request the actual payment. This triggers Toss UI redirect/iframe
            await widgets.requestPayment({
                orderId: orderId,
                orderName: "진실의 마켓 - 1개월 프리미엄 구독",
                successUrl: `${window.location.origin}/checkout/success`,
                failUrl: `${window.location.origin}/checkout/fail`,
                customerEmail: "customer@hello.com", // Usually fetched from logged in user
                customerName: "홍길동",
                customerMobilePhone: "01012341234",
            });
        } catch (error) {
            console.error("Payment failed", error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto my-16 px-4">
            <h1 className="text-3xl font-extrabold text-white mb-2">결제하기</h1>
            <p className="text-zinc-400 mb-8">프리미엄 리포트 열람 권한을 구매합니다.</p>

            <div className="bg-white rounded-3xl p-6 shadow-2xl relative min-h-[400px]">
                {/* Loader while SDK is bootstrapping */}
                {!ready && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-3xl z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-toss-blue" />
                    </div>
                )}

                {/* Toss SDK injects iFrames into these divs */}
                <div id="payment-method" className="mb-4"></div>
                <div id="agreement" className="mb-8"></div>

                <button
                    disabled={!ready}
                    onClick={handlePayment}
                    className="w-full bg-toss-blue text-white font-bold text-lg py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {amount.value.toLocaleString()}원 결제하기
                </button>
            </div>
            <div className="text-center mt-6 text-zinc-500 text-sm">
                * 현재 결제는 토스페이먼츠 <strong className="text-toss-blue">테스트 환경</strong>으로, 실제 금전이 출금되지 않습니다.
            </div>
        </div>
    );
}
