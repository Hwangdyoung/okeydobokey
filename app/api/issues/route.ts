import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Google News RSS 피드 호출
    const response = await fetch(
      'https://news.google.com/rss/search?q=한국+힙합+OR+래퍼&hl=ko&gl=KR&ceid=KR:ko',
      {
        next: { revalidate: 3600 } // 기본 revalidate도 지정 가능
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch RSS from Google News');
    }

    const xmlText = await response.text();

    // 2. Regex 정규식을 사용하여 최신 5개 기사 파싱
    // <item>...</item> 매칭
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items: any[] = [];
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xmlText)) !== null && count < 5) {
      const itemContent = match[1];

      // <title>, <link>, <source> 값 추출
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = itemContent.match(/<source[^>]*?>([\s\S]*?)<\/source>/);

      if (titleMatch && linkMatch) {
        let fullTitle = titleMatch[1].trim();
        let sourceName = sourceMatch ? sourceMatch[1].trim() : '뉴스';

        // HTML 엔티티 간단 변환 (&amp; -> &, &quot; -> ", etc.)
        fullTitle = fullTitle
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'");

        // 구글 뉴스 타이틀 끝부분의 ' - 언론사' 문구 제거 (중복 표기 방지)
        const cleanTitle = fullTitle.replace(new RegExp(`\\s*-\\s*${sourceName}$`, 'i'), '');

        items.push({
          id: Date.now() + count,
          title: cleanTitle,
          source: sourceName,
          url: linkMatch[1].trim()
        });
        count++;
      }
    }

    // 3. 한국 자정(KST Midnight) 캐시 수명 계산
    const now = new Date();
    // 한국 표준시 (UTC+9)로 변환한 날짜 정보 생성
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 한국 시간 기준 다음 자정 시각 계산
    const nextMidnightKst = new Date(kstTime);
    nextMidnightKst.setUTCHours(24, 0, 0, 0); // KST 기준으로 다음 자정

    // 자정까지 남은 시간(초) 계산
    const secondsToMidnight = Math.max(
      60, // 최소 1분 보장
      Math.floor((nextMidnightKst.getTime() - kstTime.getTime()) / 1000)
    );

    // 4. Cache-Control 헤더 주입하여 응답 반환
    return NextResponse.json(items, {
      headers: {
        'Cache-Control': `public, s-maxage=${secondsToMidnight}, stale-while-revalidate=60`
      }
    });
  } catch (error) {
    console.error('Failed to parse Issues RSS:', error);
    // 에러 발생 시 최상위 빈 배열 혹은 기본 Mock 데이터 반환
    return NextResponse.json([
      { 
        id: 1, 
        title: "실시간 힙합 뉴스를 불러오는데 실패했습니다.", 
        source: "시스템", 
        url: "/community" 
      }
    ]);
  }
}
