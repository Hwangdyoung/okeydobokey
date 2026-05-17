import { NextResponse } from 'next/server';

// 가상 DB (서버 메모리 상에 저장)
// 실제 환경에서는 데이터베이스(Prisma, Supabase 등)를 사용해야 합니다.
let posts: any[] = [];

// 전역 변수를 활용하여 서버 재시작 전까지 데이터 유지 시도
if (!(global as any).posts) {
  (global as any).posts = posts;
}

export async function GET() {
  return NextResponse.json((global as any).posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newPost = {
    ...body,
    id: Date.now(),
    likes: 0,
    likedBy: [],
    comments: [],
    date: new Date().toISOString().split('T')[0]
  };
  (global as any).posts = [newPost, ...(global as any).posts];
  return NextResponse.json(newPost);
}
