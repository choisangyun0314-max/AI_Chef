import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // request.url에서 현재 접속 도메인(origin)을 알아서 쪼개어 가져옴
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 동적으로 추출한 배포 origin 주소로 이동
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 리디렉션
  return NextResponse.redirect(`${origin}/auth-error`)
}
