import { NextResponse } from 'next/server';

const BLOCK_KEYWORDS = [
  '정치', '대통령', '국회', '선거', '정당', '여당', '야당', '민주당', '국민의힘',
  '대선', '총선', '정부', '장관', '의원', '탄핵', '검찰', '법원', '외교', '북한'
];

const ALLOW_KEYWORDS = [
  '힙합', '래퍼', '랩', '콘서트', '페스티벌', '앨범', '뮤직비디오', '싱글',
  '식케이', '창모', '키드밀리', '빈지노', '이센스', '지코', '박재범', '크러쉬',
  '딘', '자이언티', '릴러말즈', '해쉬스완', '나플라', '스윙스', '허클베리피',
  '힙플페', '랩비트', '워터밤', '쇼미더머니'
];

export async function GET() {
  try {
    const response = await fetch(
      'https://news.google.com/rss/search?q=힙합+콘서트+OR+래퍼+앨범+OR+힙합+뮤직비디오&hl=ko&gl=KR&ceid=KR:ko',
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) throw new Error('Failed to fetch RSS');

    const xmlText = await response.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items: any[] = [];
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = itemContent.match(/<source[^>]*?>([\s\S]*?)<\/source>/);

      if (titleMatch && linkMatch) {
        let fullTitle = titleMatch[1].trim()
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'");

        const sourceName = sourceMatch ? sourceMatch[1].trim() : '뉴스';
        const cleanTitle = fullTitle.replace(new RegExp(`\\s*-\\s*${sourceName}$`, 'i'), '');

        // 정치 키워드 포함 시 제외
        const hasBlockKeyword = BLOCK_KEYWORDS.some(k => cleanTitle.includes(k));
        if (hasBlockKeyword) continue;

        // 음악/힙합 관련 키워드 포함 시만 허용
        const hasAllowKeyword = ALLOW_KEYWORDS.some(k => cleanTitle.includes(k));
        if (!hasAllowKeyword) continue;

        items.push({
          id: Date.now() + items.length,
          title: cleanTitle,
          source: sourceName,
          url: linkMatch[1].trim()
        });

        if (items.length >= 5) break;
      }
    }

    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const nextMidnightKst = new Date(kstTime);
    nextMidnightKst.setUTCHours(24, 0, 0, 0);
    const secondsToMidnight = Math.max(60, Math.floor((nextMidnightKst.getTime() - kstTime.getTime()) / 1000));

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': `public, s-maxage=${secondsToMidnight}, stale-while-revalidate=60`
      }
    });

  } catch (error) {
    console.error('Failed to parse Issues RSS:', error);
    return NextResponse.json([{
      id: 1,
      title: '실시간 힙합 뉴스를 불러오는데 실패했습니다.',
      source: '시스템',
      url: '/community'
    }]);
  }
}