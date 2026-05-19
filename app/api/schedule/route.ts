import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from('concerts_with_status')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Supabase fetch 실패:', JSON.stringify(error));
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  // 기존 page.tsx 구조에 맞게 데이터 변환
  const formatted = data.map((concert) => ({
    id: concert.id,
    title: concert.title,
    date: concert.event_date,
    startDate: concert.event_date,
    endDate: concert.event_date,
    location: `${concert.venue} (${concert.city})`,
    lineup: concert.artist,
    ticketLinks: concert.ticket_url
      ? [{ vendor: '예매하기', url: concert.ticket_url }]
      : [],
    status: concert.status,
  }));

  return NextResponse.json(formatted);
}