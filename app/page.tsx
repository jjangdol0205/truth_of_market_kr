"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import ReportCard from "./components/ReportCard";
import StockCard from "../components/StockCard";
import DailyBriefing from "../components/DailyBriefing";
import HeroSearch from "../components/HeroSearch";
import SocialProof from "../components/SocialProof";
import HowItWorks from "../components/HowItWorks";
import CoupangDynamic from "../components/CoupangDynamic";
import { getKoreanName, getTickerFromName } from "../utils/krx";
import { fetchLivePricesServer } from "./actions";

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [trendingUS, setTrendingUS] = useState<any[]>([]);
  const [trendingKR, setTrendingKR] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch reports from Supabase
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reports:", JSON.stringify(error, null, 2));
      }

      // Determine Unique Tickers from DB
      let uniqueTickers = Array.from(new Set((reports || []).map((r: any) => r.ticker)));

      // Filter out US/Crypto tickers, keep KOSPI/KOSDAQ (number-based) AND Korean name strings
      // We will actually keep ALL tickers, but tag them by country for rendering!
      // uniqueTickers = uniqueTickers.filter((ticker: any) => typeof ticker === 'string' && (/^\d+$/.test(ticker) || ticker.includes('.KS') || ticker.includes('.KQ') || /[가-힣]/.test(ticker)));

      // Fetch Latest Daily Market Summary
      const { data: globalSummaries } = await supabase
        .from('market_summaries')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);

      const summary = globalSummaries && globalSummaries.length > 0 ? globalSummaries[0] : null;
      setDailySummary(summary);

      // 2. Fetch Live Quotes from Yahoo Finance Native API for Dynamic Output
      let quotesData: any[] = [];
      if (uniqueTickers.length > 0) {
        try {
          // Offload entire Yahoo Finance resolution and fetching to the Server Action 
          // to bypass Browser CORS
          quotesData = await fetchLivePricesServer(uniqueTickers);
        } catch (err) {
          console.error("Error fetching live quotes:", err);
        }
      }

      // Merge the fetched data with our dynamic watchlist details
      const trendingStocks = uniqueTickers.map((ticker: any) => {
        const liveData = quotesData.find(q => q.symbol === ticker);
        const numericTicker = getTickerFromName(ticker);
        const isUSStock = numericTicker && !/^\d+$/.test(numericTicker);
        const isKR = !isUSStock && (numericTicker !== null || /^\d+$/.test(ticker) || ticker.includes('.KS') || ticker.includes('.KQ') || /[가-힣]/.test(ticker));

        return {
          ticker: ticker,
          name: ticker,
          price: liveData?.price || 0,
          changePercent: liveData?.changePercent || 0,
          country: isKR ? 'KR' : 'US'
        };
      });

      setTrendingKR(trendingStocks.filter(s => s.country === 'KR').sort((a, b) => {
        if (a.ticker === '005930' || a.ticker === '삼성전자') return -1;
        if (b.ticker === '005930' || b.ticker === '삼성전자') return 1;
        return 0;
      }));
      setTrendingUS(trendingStocks.filter(s => s.country === 'US'));
    }

    fetchData();
  }, []);

  // Animation for counter
  useEffect(() => {
    if (reports.length > 0) {
      let start = 0;
      const end = reports.length;
      const duration = 1500;
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setDisplayCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [reports.length]);

  return (
    <div className="max-w-5xl mx-auto space-y-12 mt-10 p-4 text-gray-100 pb-24 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-toss-blue/20 rounded-full blur-[100px] animate-blob mix-blend-screen pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-10 w-80 h-80 bg-toss-red/20 rounded-full blur-[120px] animate-blob mix-blend-screen pointer-events-none -z-10" style={{ animationDelay: '2s' }}></div>

      {/* Grand Hero Section */}
      <section className="text-center space-y-4 mb-16 relative">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          AI 기반 심층 기업 분석
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          월스트리트 수준의 기본적 & 기술적 분석을 단 10초 만에 생성하세요.
        </p>

        <HeroSearch />
        
        <CoupangDynamic />

        <div className="flex flex-wrap justify-center gap-4 mt-8 px-2">
          <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-300 flex items-center shadow-lg">
            <span className="w-2 h-2 rounded-full bg-toss-green mr-2 animate-pulse"></span>
            시스템 데이터 실시간
          </span>
          <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-300 shadow-lg transition-all">
            <span className="text-white font-bold mr-1">{displayCount}</span> 종목 분석 완료
          </span>
        </div>
      </section>

      {/* Daily Briefing (FREE CONTENT) */}
      <div id="briefings-section" className="scroll-mt-24">
        <DailyBriefing summary={dailySummary} />
      </div>

      {/* Trending Stocks Grid (New Dashboard Section) */}
      <section id="reports-section" className="mb-20 space-y-10 scroll-mt-24">

        {/* US Stocks */}
        {trendingUS.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🇺🇸</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">주목할 미국 기업</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingUS.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  ticker={stock.ticker}
                  name={stock.name}
                  price={stock.price}
                  changePercent={stock.changePercent}
                  country="US"
                />
              ))}
            </div>
          </div>
        )}

        {/* KR Stocks */}
        {trendingKR.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🇰🇷</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">주목할 한국 기업</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingKR.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  ticker={stock.ticker}
                  name={stock.name}
                  price={stock.price}
                  changePercent={stock.changePercent}
                  isFreeSample={stock.ticker === '005930' || stock.ticker === '삼성전자'}
                  country="KR"
                />
              ))}
            </div>
          </div>
        )}

        {trendingUS.length === 0 && trendingKR.length === 0 && (
          <div className="text-center p-8 border border-white/5 rounded-3xl bg-[#18181A]/40 backdrop-blur-md text-zinc-500 text-sm shadow-xl">
            데이터베이스에 분석된 기업이 없습니다. 먼저 상단의 검색을 통해 리포트를 생성해보세요.
          </div>
        )}
      </section>

      {/* Social Proof & Track Record */}
      <SocialProof />

      {/* Product Education */}
      <HowItWorks />

    </div>
  );
}