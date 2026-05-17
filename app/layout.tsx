import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import Providers from './providers';

export const metadata: Metadata = {
  title: '오키도보키',
  description: '트랩, R&B, 드릴, 붐뱁 — 힙합의 세계를 탐험하세요. OkeyBokey는 힙합의 주요 서브 장르를 소개하는 인터랙티브 웹사이트입니다.',
  keywords: ['힙합', 'hip-hop', 'trap', 'R&B', 'drill', 'boom bap', '장르', '음악', 'okeybokey', '오키도보키'],
  authors: [{ name: 'OkeyBokey' }],
  icons: {
    icon: 'public/icon.png',
  },
  openGraph: {
    title: '오키도보키 | 힙합의 모든 것',
    description: '트랩, R&B, 드릴, 붐뱁 — 힙합의 세계를 탐험하세요.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <CustomCursor />
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
