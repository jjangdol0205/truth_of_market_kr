"use client";
import React, { useEffect, useRef } from 'react';

export default function TradingViewWidget({ ticker, queryTicker }: { ticker: string; queryTicker?: string }) {
  const containerId = `tv_chart_${ticker}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        let tvSymbol = ticker.trim();
        // If queryTicker is provided (e.g. "005930.KS"), format it as KRX:005930
        if (queryTicker) {
          const rawSymbol = queryTicker.split('.')[0];
          tvSymbol = `KRX:${rawSymbol}`;
        } else if (tvSymbol.length === 6 && !isNaN(Number(tvSymbol))) {
          tvSymbol = `KRX:${tvSymbol}`;
        }

        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Asia/Seoul",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          container_id: containerRef.current.id,
          // 단테 기법 5, 15, 56, 112, 224일선 세팅
          studies: ["EMA@tv-basicstudies", "EMA@tv-basicstudies", "EMA@ThemeRiver", "EMA@ThemeRiver", "EMA@ThemeRiver"]
        });
      }
    };
    document.body.appendChild(script);
  }, [ticker]);

  return (
    <div id={containerId} ref={containerRef} className="w-full h-full" />
  );
}

declare global {
  interface Window {
    TradingView: any;
  }
}
