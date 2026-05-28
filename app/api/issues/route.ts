import { NextResponse } from 'next/server';

const BLOCK_KEYWORDS = [
  '정치', '대통령', '국회', '선거', '정당', '여당', '야당', '민주당', '국민의힘',
  '대선', '총선', '정부', '장관', '의원', '탄핵', '검찰', '법원', '외교', '북한'
];

export async function GET() {
  try {
    const queries = [
      '힙합+래퍼',
      '힙합+앨범+OR+힙합+콘서트',
      '래퍼+뮤직비디오+OR+래퍼+싱글',
    ];

    const allItems: any[] = [];

    for (const q of queries) {
      if (allItems.length >= 5) break;

      const response = await fetch(
        `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`,
        { cache: 'no-store' }  // 캐시 완전 제거
      );

      if (!response.ok) continue;

      const xmlText = await response.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;

      while ((match = itemRegex.exec(xmlText)) !== null && allItems.length < 5) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const sourceMatch = itemContent.match(/<source[^>]*?>([\s\S]*?)<\/source>/);
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        if (titleMatch && linkMatch) {
          let fullTitle = titleMatch[1].trim()
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'");

          const sourceName = sourceMatch ? sourceMatch[1].trim() : '뉴스';
          const cleanTitle = fullTitle.replace(new RegExp(`\\s*-\\s*${sourceName}$`, 'i'), '');

          const hasBlockKeyword = BLOCK_KEYWORDS.some(k => cleanTitle.includes(k));
          if (hasBlockKeyword) continue;

          // 중복 제거
          if (allItems.some(i => i.title === cleanTitle)) continue;

          allItems.push({
            id: Date.now() + allItems.length,
            title: cleanTitle,
            source: sourceName,
            url: linkMatch[1].trim(),
            date: pubDateMatch ? pubDateMatch[1].trim() : '',
          });
        }
      }
    }

    return NextResponse.json(allItems, {
      headers: {
        'Cache-Control': 'no-store',
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