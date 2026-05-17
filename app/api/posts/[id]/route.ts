import { NextResponse } from 'next/server';

// 1. 단일 게시물 반환 (GET)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params || !params.id) {
    return NextResponse.json({ error: '올바르지 않은 파라미터 요청입니다.' }, { status: 400 });
  }

  const posts = (global as any).posts || [];
  const post = posts.find((p: any) => String(p.id) === String(params.id));
  
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(post);
}

// 2. 단일 게시물 데이터 수정/병합 (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params || !params.id) {
    return NextResponse.json({ error: '올바르지 않은 파라미터 요청입니다.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const posts = (global as any).posts || [];
    const postIndex = posts.findIndex((p: any) => String(p.id) === String(params.id));
    
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const updatedPost = { ...posts[postIndex], ...body };
    posts[postIndex] = updatedPost;
    
    (global as any).posts = [...posts];
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: '데이터 업데이트 실패' }, { status: 400 });
  }
}

// 3. 단일 게시물 제거 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params || !params.id) {
    return NextResponse.json({ error: '올바르지 않은 파라미터 요청입니다.' }, { status: 400 });
  }

  const posts = (global as any).posts || [];
  (global as any).posts = posts.filter((p: any) => String(p.id) !== String(params.id));
  return NextResponse.json({ success: true });
}
