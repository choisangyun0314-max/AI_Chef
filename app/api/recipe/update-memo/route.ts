import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    // 로그인 유저 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const { recipeId, memo } = await request.json()

    if (!recipeId) {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다.' }, { status: 400 })
    }

    // 해당 레시피의 user_memo 컬럼만 업데이트 (유저 보안 매칭 포함)
    const { data, error } = await supabase
      .from('saved_recipes')
      .update({ user_memo: memo })
      .eq('id', Number(recipeId))
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: '해당 레시피를 수정할 권한이 없거나 레시피를 찾을 수 없습니다. 데이터베이스 RLS 설정(UPDATE 정책)을 확인해 주세요.' 
      }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('메모 저장 에러:', error)
    return NextResponse.json({ error: '메모를 저장하는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
