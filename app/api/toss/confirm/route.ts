import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { paymentKey, orderId, amount } = await req.json();

        if (!paymentKey || !orderId || !amount) {
            return NextResponse.json({ success: false, message: "Missing required parameters." }, { status: 400 });
        }

        const secretKey = process.env.TOSS_SECRET_KEY;
        if (!secretKey) {
            console.error("TOSS_SECRET_KEY is missing from environment variables.");
            return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
        }

        // Toss Payments requires the secret key to be Base64 encoded with a colon appended at the end
        // e.g., Base64(secretKey + ":")
        const encryptedSecretKey = Buffer.from(secretKey + ":").toString("base64");

        // Request final payment confirmation from Toss Servers
        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                Authorization: `Basic ${encryptedSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderId: orderId,
                amount: amount,
                paymentKey: paymentKey,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Setup DB logging later here (e.g. Supabase insert into `transactions` table)
            // await supabase.from('transactions').insert({ order_id: orderId, amount: amount, status: 'DONE', payment_key: paymentKey });

            return NextResponse.json({ success: true, payment: data });
        } else {
            // The toss API returned an error (e.g., insufficient funds, user canceled, invalid amount)
            console.error("Toss Confirm Error:", data);
            return NextResponse.json({ success: false, message: data.message || "Payment confirmation failed." }, { status: response.status });
        }

    } catch (error) {
        console.error("Confirm Route Exception:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
