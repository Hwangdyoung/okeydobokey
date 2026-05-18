/**
 * Supabase Auth 패키지 설치 안내:
 * 터미널에 아래 명령어를 실행하여 필요한 의존성 패키지를 반드시 설치해 주세요.
 * 
 * 명령: npm install @supabase/supabase-js @supabase/ssr
 */

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.dummy_signature';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      'Supabase URL or Anon Key is missing. Fallback placeholders are used for pre-rendering.'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
};
