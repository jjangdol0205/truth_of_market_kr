import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Check for authenticated user (optional, but we capture if available)
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        const body = await req.json();
        const { companyName, ticker } = body;

        // Basic validation
        if (!companyName || companyName.trim() === '') {
            return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
        }

        // Insert into database
        const { error } = await supabase
            .from('company_requests')
            .insert([
                {
                    company_name: companyName.trim(),
                    ticker: ticker ? ticker.trim().toUpperCase() : null,
                    user_id: userId,
                    status: 'pending'
                }
            ]);

        if (error) {
            console.error('Database insertion error:', error);
            return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Request submitted successfully' }, { status: 200 });

    } catch (err: any) {
        console.error('Request processing error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
