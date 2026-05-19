import { createClient } from './client';

export type Concert = {
    id: string;
    title: string;
    artist: string | null;
    venue: string;
    city: string;
    event_date: string;
    event_time: string | null;
    doors_open: string | null;
    ticket_url: string | null;
    ticket_price: string | null;
    ticket_open_date: string | null;
    genre: string;
    festival: boolean;
    poster_url: string | null;
    description: string | null;
    is_confirmed: boolean;
    status: '예정' | '임박' | '오늘공연' | '공연종료';
};

// 전체 공연 목록 (종료된 공연 제외)
export async function getConcerts(): Promise<Concert[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('concerts_with_status')
        .select('*')
        .neq('status', '공연종료')
        .order('event_date', { ascending: true });

    if (error) {
        console.error('공연 데이터 fetch 실패:', error);
        return [];
    }

    return data as Concert[];
}

// 종료된 공연 포함 전체
export async function getAllConcerts(): Promise<Concert[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('concerts_with_status')
        .select('*')
        .order('event_date', { ascending: true });

    if (error) {
        console.error('공연 데이터 fetch 실패:', error);
        return [];
    }

    return data as Concert[];
}