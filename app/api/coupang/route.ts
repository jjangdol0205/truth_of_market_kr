import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '주식 모니터';
    const limit = searchParams.get('limit') || '3';

    const accessKey = process.env.COUPANG_ACCESS_KEY;
    const secretKey = process.env.COUPANG_SECRET_KEY;

    if (!accessKey || !secretKey) {
        return NextResponse.json({ error: 'Coupang API keys missing' }, { status: 500 });
    }

    const domain = "https://api-gateway.coupang.com";
    const url = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;

    // Generate HMAC signature
    const method = 'GET';
    const datetime = new Date().toISOString().substring(0, 19).replace(/[-:T]/g, '') + 'Z'; // yyyymmddHHMMSSZ format
    const message = datetime + method + url;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('hex');

    const authorization = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;

    try {
        const response = await fetch(domain + url, {
            method: method,
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Coupang API Error:', errData);
            return NextResponse.json({ error: 'Failed to fetch products from Coupang' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Coupang API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
