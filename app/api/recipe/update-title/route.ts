import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    // 유저 로그인 상태 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const { recipeId, newTitle } = await request.json()

    if (!recipeId || !newTitle || !newTitle.trim()) {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다.' }, { status: 400 })
    }

    // 1. 기존 데이터를 가져와서 자바스크립트로 수정
    const { data: current, error: selectError } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .eq('id', Number(recipeId))
      .eq('user_id', user.id)
      .single()

    if (selectError || !current) {
      return NextResponse.json({ error: '수정할 레시피를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. title 키값만 변경하여 덮어쓰기
    const updatedData = {
      ...(current.recipe_data as Record<string, any>),
      title: newTitle.trim(),
    }

    // 3. 테이블에 업데이트 반영
    const { data, error: updateError } = await supabase
      .from('saved_recipes')
      .update({ recipe_data: updatedData })
      .eq('id', Number(recipeId))
      .eq('user_id', user.id)
      .select()

    if (updateError) throw updateError

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: '해당 레시피를 수정할 권한이 없거나 레시피를 찾을 수 없습니다. 데이터베이스 RLS 설정(UPDATE 정책)을 확인해 주세요.' 
      }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('이름 수정 에러:', error)
    return NextResponse.json({ error: '요리 이름을 변경하는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
