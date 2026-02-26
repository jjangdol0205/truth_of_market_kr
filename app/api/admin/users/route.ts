import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from '@/utils/supabase/server'

// Use service role to completely bypass RLS so the admin page can pull all users
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.email !== "beable9489@gmail.com") {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: users, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Profiles Fetch Error:', error);
            throw error;
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('API /admin/users Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
