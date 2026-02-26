export const krxTickers: Record<string, string> = {
    '005930': '삼성전자',
    '000660': 'SK하이닉스',
    '373220': 'LG에너지솔루션',
    '207940': '삼성바이오로직스',
    '005380': '현대차',
    '000270': '기아',
    '068270': '셀트리온',
    '005490': 'POSCO홀딩스',
    '105560': 'KB금융',
    '035420': 'NAVER',
    '028260': '삼성물산',
    '055550': '신한지주',
    '051910': 'LG화학',
    '032830': '삼성생명',
    '012330': '현대모비스',
    '036570': '엔씨소프트',
    '035720': '카카오'
};

export function getKoreanName(ticker: string): string {
    return krxTickers[ticker] || ticker;
}
