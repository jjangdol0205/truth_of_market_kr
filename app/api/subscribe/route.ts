import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("subscribers")
            .insert([{ email: email.toLowerCase() }]);

        if (error) {
            // Check for unique violation error code (23505 in Postgres)
            if (error.code === "23505") {
                return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
            }
            console.error("Subscription error:", error);
            return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ message: "Successfully subscribed! Check your inbox soon." }, { status: 200 });
    } catch (err) {
        console.error("Server error during subscription:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
