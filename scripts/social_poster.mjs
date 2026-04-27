import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing. Exiting.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Twitter Credentials
const twitterClient = process.env.TWITTER_API_KEY ? new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
}) : null;

// Threads Credentials
const THREADS_ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com';

async function postToTwitter(text) {
    if (!twitterClient) {
        console.log('Twitter API keys not provided. Skipping Twitter post.');
        return;
    }
    try {
        await twitterClient.v2.tweet(text);
        console.log('✅ Successfully posted to Twitter!');
    } catch (error) {
        console.error('❌ Failed to post to Twitter:', error);
    }
}

async function postToThreads(text) {
    if (!THREADS_ACCESS_TOKEN || !THREADS_USER_ID) {
        console.log('Threads API keys not provided. Skipping Threads post.');
        return;
    }
    try {
        // Step 1: Create media container
        const createRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads?media_type=TEXT&text=${encodeURIComponent(text)}&access_token=${THREADS_ACCESS_TOKEN}`, {
            method: 'POST'
        });
        const createData = await createRes.json();
        
        if (createData.id) {
            // Step 2: Publish container
            const publishRes = await fetch(`https://graph.threads.net/v1.0/${THREADS_USER_ID}/threads_publish?creation_id=${createData.id}&access_token=${THREADS_ACCESS_TOKEN}`, {
                method: 'POST'
            });
            const publishData = await publishRes.json();
            if (publishData.id) {
                console.log('✅ Successfully posted to Threads!');
            } else {
                console.error('❌ Failed to publish to Threads:', publishData);
            }
        } else {
            console.error('❌ Failed to create Threads container:', createData);
        }
    } catch (error) {
        console.error('❌ Failed to post to Threads:', error);
    }
}

async function run() {
    console.log('🤖 Starting Social Poster Bot...');
    
    // Fetch latest briefing
    const { data, error } = await supabase
        .from('market_summaries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
    if (error || !data) {
        console.error('Failed to fetch latest market summary from Supabase', error);
        process.exit(1);
    }
    
    // Check if the summary is from today to avoid spamming old data
    const summaryDate = new Date(data.date);
    const today = new Date();
    // Allow max 24 hour difference
    const diffHours = Math.abs(today - summaryDate) / 36e5;
    
    if (diffHours > 24) {
        console.log(`Latest summary (${data.date}) is too old. Skipping post.`);
        return;
    }

    const title = data.title;
    let snippet = data.content.substring(0, 80).replace(/\n/g, ' ').replace(/#/g, '').trim();
    if (data.content.length > 80) snippet += '...';

    const postText = `🌎 [투자의 진실] ${data.date} 시황 브리핑!\n\n🔥 ${title}\n\n${snippet}\n\nAI 기반 투자 시황과 핵심 종목 리포트를 무료로 확인하세요.\n➡️ ${SITE_URL}/#briefings-section\n\n#미국증시 #국내증시 #주식투자 #나스닥`;

    console.log(`\n============================\nPreparing to post:\n${postText}\n============================\n`);

    await postToTwitter(postText);
    await postToThreads(postText);
    
    console.log('🏁 Social Poster Bot Finished.');
}

run();
