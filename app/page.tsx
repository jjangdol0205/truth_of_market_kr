import Link from "next/link";
import { supabase } from "./lib/supabase";
import ReportCard from "./components/ReportCard";
import StockCard from "../components/StockCard";
import LeadMagnet from "./components/LeadMagnet";
import DailyBriefing from "../components/DailyBriefing";
import HeroSearch from "../components/HeroSearch";
import SocialProof from "../components/SocialProof";
import HowItWorks from "../components/HowItWorks";
import { getKoreanName } from "../utils/krx";

// 30초마다 데이터 갱신 (ISR)
export const revalidate = 0;

export default async function Home() {
  // 1. Fetch reports from Supabase
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reports:", JSON.stringify(error, null, 2));
  }

  // Determine Unique Tickers from DB
  let uniqueTickers = Array.from(new Set((reports || []).map(r => r.ticker)));

  // Filter out US/Crypto tickers, keep KOSPI/KOSDAQ (number-based) AND Korean name strings
  uniqueTickers = uniqueTickers.filter(ticker => /^\d+$/.test(ticker) || ticker.includes('.KS') || ticker.includes('.KQ') || /[가-힣]/.test(ticker));

  // Fetch Latest Daily Market Summary
  const { data: globalSummaries } = await supabase
    .from('market_summaries')
    .select('*')
    .order('date', { ascending: false })
    .limit(1);

  const dailySummary = globalSummaries && globalSummaries.length > 0 ? globalSummaries[0] : null;

  // 2. Fetch Live Quotes from Yahoo Finance Native API for Dynamic Output
  let quotesData: any[] = [];
  if (uniqueTickers.length > 0) {
    try {
      const fetchPromises = uniqueTickers.map(async (ticker) => {
        // Handle crypto edge-cases gracefully if needed
        let queryTicker = ticker;
        if (/^\d+$/.test(ticker)) {
          queryTicker = `${ticker}.KS`;
        } else if (ticker === "LNK") {
          queryTicker = "LINK-USD";
        }
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`;

        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } });
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta) {
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const changePercent = ((price - previousClose) / previousClose) * 100;
            return { symbol: ticker, price, changePercent };
          }
        } catch (e) {
          console.error(`Failed to fetch ${ticker}`, e);
        }
        return { symbol: ticker, price: 0, changePercent: 0 };
      });

      quotesData = await Promise.all(fetchPromises);
    } catch (err) {
      console.error("Error fetching live quotes:", err);
    }
  }

  // Merge the fetched data with our dynamic watchlist details
  const trendingStocks = uniqueTickers.map(ticker => {
    const liveData = quotesData.find(q => q.symbol === ticker);
    return {
      ticker: ticker,
      name: getKoreanName(ticker), // Fallback name to Ticker string mapped by KRX dictionary
      price: liveData?.price || 0,
      changePercent: liveData?.changePercent || 0
    };
  });

  // Sort exactly to put 005930 first
  trendingStocks.sort((a, b) => {
    if (a.ticker === '005930') return -1;
    if (b.ticker === '005930') return 1;
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 mt-10 p-4  text-gray-100">
      {/* Grand Hero Section */}
      <section className="text-center space-y-4 mb-16 relative">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          AI 기반 심층 기업 분석
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          월스트리트 수준의 기본적 & 기술적 분석을 단 10초 만에 생성하세요.
        </p>

        <HeroSearch />

        <div className="flex flex-wrap justify-center gap-4 mt-8 px-2">
          <span className="px-3 py-1.5 rounded-full bg-toss-card text-xs font-semibold text-zinc-400 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-toss-blue mr-2"></span>
            시스템 데이터 실시간
          </span>
          <span className="px-3 py-1.5 rounded-full bg-toss-card text-xs font-semibold text-zinc-400">
            {reports?.length || 0} 종목 분석 완료
          </span>
        </div>
      </section>

      {/* Daily Briefing (FREE CONTENT) */}
      <DailyBriefing summary={dailySummary} />

      {/* Trending Stocks Grid (New Dashboard Section) */}
      <section className="mb-20">
        <h3 className="text-2xl font-bold text-white mb-6">
          실시간 주목할 기업
        </h3>
        {trendingStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingStocks.map((stock) => (
              <StockCard
                key={stock.ticker}
                ticker={stock.ticker}
                name={stock.name}
                price={stock.price}
                changePercent={stock.changePercent}
                isFreeSample={stock.ticker === '005930'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-toss-border rounded-2xl bg-toss-card/50 text-zinc-500  text-sm">
            데이터베이스에 분석된 기업이 없습니다.
          </div>
        )}
      </section>

      {/* Social Proof & Track Record */}
      <SocialProof />

      {/* Product Education */}
      <HowItWorks />



      {/* Lead Magnet Section */}
      <section className="mb-20">
        <LeadMagnet />
      </section>

    </div>
  );
}