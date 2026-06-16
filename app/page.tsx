'use client'

import React, { useState, useEffect } from 'react'
import Refrigerator from './components/Refrigerator'
import Basket from './components/Basket'
import SavedRecipesModal from './components/SavedRecipesModal'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface Ingredient {
  id: number | string
  category: string
  sub_category: string
  name: string
}

interface RecipeData {
  title: string
  difficulty: '초급' | '중급' | '고급'
  cookingTime: string
  ingredientsUsed: string[]
  basicPantry: string[]
  steps: string[]
  chefTip: string
  isMock?: boolean
  apiError?: string
}

interface SavedRecipe {
  id: number | string
  user_id: string
  recipe_data: RecipeData
  created_at: string
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCooking, setIsCooking] = useState<boolean>(false)
  const [recipe, setRecipe] = useState<RecipeData | null>(null)

  // 보관함 관련 상태
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [isSavedLoading, setIsSavedLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // 전역 Auth Context 사용
  const { user, signOut, refreshSession } = useAuth()

  // 컴포넌트 로드 시 API Route를 통해 Supabase에서 식재료 데이터 가져오기 & Auth 팝업 처리
  useEffect(() => {
    // 팝업 창 안에서 로그인 성공 후 리다이렉트 되었는지 감지
    if (typeof window !== 'undefined' && window.name === 'supabase-oauth-popup') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          if (window.opener) {
            window.opener.postMessage('auth-success', window.location.origin)
          }
          window.close()
        }
      })
      return // 팝업인 경우 아래의 식재료 로드 및 이벤트 리스너 바인딩을 원천 차단
    }

    async function fetchIngredients() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/ingredients')
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        if (data && !data.error) {
          setIngredients(data as Ingredient[])
        } else {
          throw new Error(data.error || 'Failed to parse ingredients')
        }
      } catch (error) {
        console.error('식재료를 불러오는 중 오류가 발생했습니다:', error)
        alert('데이터베이스 연결 실패. API 엔드포인트 또는 Supabase 설정을 확인해 주세요!')
      } finally {
        setIsLoading(false)
      }
    }

    fetchIngredients()

    // 팝업으로부터의 로그인 성공 메시지 이벤트 수신
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data === 'auth-success') {
        refreshSession()
      }
    }
    window.addEventListener('message', handleAuthMessage)

    return () => {
      window.removeEventListener('message', handleAuthMessage)
    }
  }, [refreshSession])

  // 로그인 상태 변화 시 보관함 데이터 사전 조회 및 요리 바구니 초기화
  useEffect(() => {
    setSelectedIngredients([])
    if (user) {
      fetchSavedRecipes()
    } else {
      setSavedRecipes([])
    }
  }, [user])

  // 보관함 데이터 로드 함수
  const fetchSavedRecipes = async () => {
    if (!user) return
    try {
      setIsSavedLoading(true)
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedRecipes(data as SavedRecipe[] || [])
    } catch (err: any) {
      console.error('보관함 레시피 로드 에러:', err.message)
    } finally {
      setIsSavedLoading(false)
    }
  }

  // 레시피 보관함 저장 함수
  const handleSaveRecipe = async () => {
    if (!user) {
      alert('구글 로그인을 하시면 마음에 드는 레시피를 저장할 수 있습니다!')
      return
    }
    if (!recipe) return

    // 이미 저장된 레시피인지 체크
    const isAlreadySaved = savedRecipes.some(
      (r) => r.recipe_data.title === recipe.title
    )
    if (isAlreadySaved) {
      alert('이미 보관함에 저장된 레시피입니다.')
      return
    }

    try {
      setIsSaving(true)
      // Supabase의 saved_recipes 테이블에 insert 실행
      const { error } = await supabase.from('saved_recipes').insert({
        user_id: user.id, // AuthContext에서 꺼내온 실제 구글 유저 UUID
        recipe_data: recipe, // 구조화된 레시피 데이터 객체 통째로 저장
      })

      if (error) throw error
      alert('나만의 레시피 보관함에 성공적으로 저장되었습니다!')
      
      // 보관함 데이터 갱신
      await fetchSavedRecipes()
    } catch (error: any) {
      console.error('레시피 저장 에러:', error.message)
      alert('레시피를 저장하는 중 오류가 발생했습니다. (데이터베이스 테이블 설정 확인 필요)')
    } finally {
      setIsSaving(false)
    }
  }

  // 보관함 레시피 삭제
  const handleDeleteSavedRecipe = async (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트(모달 오픈) 방지
    if (!confirm('정말 이 레시피를 보관함에서 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSavedRecipes((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      console.error('레시피 삭제 에러:', err.message)
      alert('레시피 삭제 중 오류가 발생했습니다.')
    }
  }

  // Google 로그인 팝업 호출
  const handleGoogleLogin = () => {
    window.open(
      '/auth', 
      'supabase-oauth-popup', 
      'width=500,height=600,resizable=yes,scrollbars=yes'
    )
  }

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut()
      setIsSavedModalOpen(false)
      setSavedRecipes([])
      setSelectedIngredients([])
    } catch (error: any) {
      alert('로그아웃 중 오류가 발생했습니다: ' + error.message)
    }
  }

  // 식재료 선택 토글 함수
  const handleToggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
      prev.some((item) => item.id === ingredient.id)
        ? prev.filter((item) => item.id !== ingredient.id)
        : [...prev, ingredient]
    )
  }

  // AI 요리하기 버튼 액션 (Gemini API 호출)
  const handleCook = async (style: string) => {
    if (selectedIngredients.length === 0) return

    try {
      setIsCooking(true)
      const ingredientNames = selectedIngredients.map((i) => i.name)
      
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientNames, style }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '레시피 생성 실패')
      }

      const data = await res.json()
      setRecipe(data as RecipeData)
    } catch (error: any) {
      console.error('레시피 생성 에러:', error)
      alert(error.message || '레시피를 생성하는 중 오류가 발생했습니다.')
    } finally {
      setIsCooking(false)
    }
  }

  // 클라이언트 사이드에서 JSON을 깔끔한 마크다운 문서로 변환해 주는 함수
  const handleDownloadMarkdown = () => {
    if (!recipe) return

    const markdownContent = [
      '---',
      `### 추천 요리: ${recipe.title}`,
      `- **난이도:** ${recipe.difficulty}`,
      `- **소요 시간:** ${recipe.cookingTime}`,
      '',
      '#### 준비 재료',
      `- **선택한 재료:** ${recipe.ingredientsUsed.join(', ')}`,
      `- **기본 양념:** ${recipe.basicPantry.join(', ')}`,
      '',
      '#### 조리 순서',
      recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
      '',
      '#### 셰프의 꿀팁',
      `- ${recipe.chefTip}`,
      '---'
    ].join('\n')

    // 파일 다운로드 실행
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${recipe.title.replace(/\s+/g, '_')}_레시피.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-sky-50 flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden">
      {/* Background soft glowing blur effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-sky-400/10 via-blue-500/0 to-transparent blur-[120px] pointer-events-none" />

      {/* 우측 상단 로그인 영역 */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        {user ? (
          <div className="relative group">
            {/* 사용자 프로필 사진 버튼 */}
            <button className="flex items-center gap-2.5 bg-white border border-zinc-200/80 rounded-full p-1.5 pr-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-100 shadow-sm"
                  alt="User avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center text-xs">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-[11px] font-bold text-zinc-700 select-none">
                {user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}
              </span>
            </button>

            {/* 호버 시 노출되는 팝오버 메뉴 */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-2.5 transition-all duration-300 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 pointer-events-auto">
              <div className="flex flex-col gap-0.5 text-left select-none">
                <span className="text-xs font-black text-zinc-800 line-clamp-1">
                  {user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}
                </span>
                <span className="text-[10px] text-zinc-450 font-semibold truncate">
                  {user.email}
                </span>
              </div>
              <div className="w-full h-[1px] bg-zinc-150" />
              
              {/* 보관함 열기 버튼 */}
              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="w-full text-left py-2 px-3 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-xs font-bold text-zinc-600 transition-colors cursor-pointer flex items-center gap-1.5 border-0 bg-transparent"
              >
                <span>보관함 보기</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 hover:bg-red-50 hover:text-red-655 rounded-xl text-xs font-bold text-zinc-650 transition-colors cursor-pointer flex items-center gap-1.5 border-0 bg-transparent"
              >
                <span>로그아웃 (Sign Out)</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="bg-white/80 backdrop-blur-md hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 px-4 py-2.5 rounded-2xl text-xs font-bold transition duration-300 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {/* Google G Logo SVG */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google 로그인</span>
          </button>
        )}
      </div>

      <header className="text-center z-10 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-855">
          AI Chef : 냉장고를 부탁해
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm mt-2 font-semibold">
          남은 식재료를 골라 맞춤형 레시피를 제안받으세요.
        </p>
      </header>

      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[650px] w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl border border-zinc-200/80 shadow-[0_15px_35px_rgba(0,0,0,0.03)] z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-sky-500 mb-4"></div>
          <p className="text-zinc-600 font-semibold tracking-wide animate-pulse text-sm">냉장고 채우는 중...</p>
        </div>
      ) : (
        /* 데이터 로드가 끝나면 보여줄 메인 컨텐츠 영역 */
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 w-full max-w-4xl z-10">
          {/* 왼쪽: 냉장고 */}
          <Refrigerator
            ingredients={ingredients}
            selectedIngredients={selectedIngredients}
            onToggleIngredient={handleToggleIngredient}
          />

          {/* 오른쪽: 바구니 */}
          <Basket
            selectedIngredients={selectedIngredients}
            onRemoveIngredient={handleToggleIngredient}
            onCook={handleCook}
          />
        </div>
      )}

      {/* --- 요리 생성 대기 중 (isCooking) 로딩 모달 --- */}
      {isCooking && (
        <div className="fixed inset-0 bg-white/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="relative mb-6">
            <div className="text-xl font-bold tracking-widest text-amber-600 animate-pulse">COOKING</div>
            <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-sm pointer-events-none -z-10 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-amber-500 mb-4"></div>
          <p className="text-zinc-800 text-base font-black tracking-wide animate-pulse">Gemini 셰프가 레시피를 구상 중입니다...</p>
          <p className="text-zinc-500 text-xs mt-1 font-semibold">최고의 조합을 생각하는 데 약 10~15초 소요됩니다.</p>
        </div>
      )}

      {/* --- 레시피 결과 모달 (recipe) --- */}
      {recipe && (() => {
        const isRecipeSaved = savedRecipes.some((r) => r.recipe_data.title === recipe.title)
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-150 flex flex-col gap-2.5">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full select-none">
                    오늘의 추천 요리
                  </span>
                  <button 
                    onClick={() => setRecipe(null)}
                    className="text-zinc-400 hover:text-zinc-650 font-bold text-lg p-1 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-855 tracking-tight leading-snug">
                  {recipe.title}
                </h2>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    recipe.difficulty === '초급' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : recipe.difficulty === '중급' 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    난이도: {recipe.difficulty}
                  </span>
                  <span className="text-[10px] font-bold bg-zinc-50 border border-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    소요 시간: {recipe.cookingTime}
                  </span>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-zinc-800">
                {recipe.isMock && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1 text-[11px] text-amber-800 leading-relaxed font-semibold">
                    <div className="flex items-center gap-1.5 font-black">
                      [안내] API Key 크레딧 소진으로 인한 데모 레시피 작동 중
                    </div>
                    <p className="opacity-90 font-medium text-left">
                      구글 계정의 크레딧이 만료되어 임시 생성된 레시피입니다. (에러: {recipe.apiError})
                    </p>
                  </div>
                )}
                {/* Ingredients section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 p-4.5 rounded-2xl">
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">사용된 식재료</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.ingredientsUsed.map((item, idx) => (
                        <span key={idx} className="bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">기본 구비 필요 양념</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.basicPantry.map((item, idx) => (
                        <span key={idx} className="bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cooking Steps */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-zinc-855 tracking-wider">상세 조리 순서</h3>
                  <div className="space-y-3.5">
                    {recipe.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500 text-neutral-950 flex items-center justify-center text-[10px] font-black font-mono shadow-sm mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef's Tip */}
                <div className="bg-amber-50/70 border border-amber-200 p-4.5 rounded-2xl relative overflow-hidden flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    셰프의 꿀팁 (Chef&apos;s Tip)
                  </h4>
                  <p className="text-xs text-amber-800/90 leading-relaxed font-semibold">
                    {recipe.chefTip}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-150 bg-zinc-50/50 flex justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-5 py-3 bg-white border border-zinc-200/80 hover:border-zinc-300/80 rounded-xl text-xs font-extrabold text-zinc-650 hover:bg-zinc-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    다운로드
                  </button>
                  <button
                    onClick={handleSaveRecipe}
                    disabled={isRecipeSaved || isSaving}
                    className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-300 shadow-md flex items-center gap-1.5 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                      isRecipeSaved 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/60 shadow-none' 
                        : 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]'
                    }`}
                  >
                    {isRecipeSaved ? '저장됨' : isSaving ? '저장 중...' : '보관함에 저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* --- 나의 레시피 보관함 (isSavedModalOpen) 팝업 모달 --- */}
      <SavedRecipesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onSelectRecipe={(recipeData) => setRecipe(recipeData)}
        onRefresh={fetchSavedRecipes}
      />
    </main>
  )
}
