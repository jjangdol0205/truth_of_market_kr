import nameToTickerMap from './name_to_ticker.json';
import tickerToNameMap from './ticker_to_name.json';

// Type assertion for the imported JSONs
const nameToTicker = nameToTickerMap as Record<string, string>;
const tickerToName = tickerToNameMap as Record<string, string>;

const usNameToTicker: Record<string, string> = {
    "NVIDIA": "NVDA",
    "APPLE": "AAPL",
    "MICROSOFT": "MSFT",
    "TESLA": "TSLA",
    "META": "META",
    "AMAZON": "AMZN",
    "ALPHABET": "GOOGL",
    "AMD": "AMD",
    "PALANTIR": "PLTR",
    "BROADCOM": "AVGO"
};

export function getKoreanName(ticker: string): string {
    return tickerToName[ticker] || ticker;
}

export function getTickerFromName(name: string): string | null {
    const upperName = name.toUpperCase();
    
    // US Stocks match
    if (usNameToTicker[upperName]) return usNameToTicker[upperName];

    // Exact match
    if (nameToTicker[name]) return nameToTicker[name];
    if (nameToTicker[upperName]) return nameToTicker[upperName];

    // Fallback: If they entered a valid numeric ticker directly, return it
    if (/^[0-9]{6}$/.test(name) && tickerToName[name]) return name;

    return null;
}

export async function resolveYahooTicker(numericTicker: string): Promise<string> {
    try {
        const searchRes = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${numericTicker}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 86400 } // Cache heavily to prevent rate limits
        });

        if (searchRes.ok) {
            const data = await searchRes.json();
            const koStock = data.quotes?.find((q: any) => q.symbol?.endsWith('.KS') || q.symbol?.endsWith('.KQ'));
            if (koStock) {
                return koStock.symbol;
            }
        }
    } catch (e) {
        console.error(`Failed to resolve Yahoo Ticker for ${numericTicker}`, e);
    }

    // Fallback to .KS if search fails
    return `${numericTicker}.KS`;
}
