'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface RecipeData {
  title: string
  difficulty: '초급' | '중급' | '고급'
  cookingTime: string
  ingredientsUsed: string[]
  basicPantry: string[]
  steps: string[]
  chefTip: string
}

interface SavedRecipe {
  id: string
  recipe_data: RecipeData
  user_memo: string
  created_at: string
}

interface SavedRecipesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRecipe: (recipe: RecipeData) => void
  onRefresh: () => void
}

export default function SavedRecipesModal({
  isOpen,
  onClose,
  onSelectRecipe,
  onRefresh,
}: SavedRecipesModalProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 이름 수정 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // 메모 수정 관련 상태 관리
  const [memoStates, setMemoStates] = useState<Record<string, string>>({})

  // 저장된 레시피 리스트 불러오기
  const fetchSavedRecipes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const fetchedRecipes = data as SavedRecipe[]
      setRecipes(fetchedRecipes)

      // 불러온 메모 데이터를 상태값에 초기 매핑
      const initialMemos: Record<string, string> = {}
      fetchedRecipes.forEach((item) => {
        initialMemos[item.id] = item.user_memo || ''
      })
      setMemoStates(initialMemos)
    } catch (error) {
      console.error(error)
      alert('보관함 레시피를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSavedRecipes()
    }
  }, [isOpen])

  // 요리 이름 업데이트
  const handleUpdateTitle = async (recipeId: string) => {
    if (!editTitle.trim()) return

    try {
      const response = await fetch('/api/recipe/update-title', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, newTitle: editTitle }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '이름 수정 중 에러가 발생했습니다.')
      }

      setRecipes((prev) =>
        prev.map((item) =>
          item.id === recipeId
            ? { ...item, recipe_data: { ...item.recipe_data, title: editTitle } }
            : item
        )
      )
      setEditingId(null)
      onRefresh()
    } catch (error: any) {
      alert(error.message || '이름 수정 중 에러가 발생했습니다.')
    }
  }

  // 메모 데이터베이스 실시간 업데이트 함수
  const handleSaveMemo = async (recipeId: string) => {
    const currentMemo = memoStates[recipeId] || ''
    try {
      const response = await fetch('/api/recipe/update-memo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, memo: currentMemo }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '메모를 저장하는 중 오류가 발생했습니다.')
      }
      alert('요리 메모가 저장되었습니다.')
    } catch (error: any) {
      alert(error.message || '메모를 저장하는 중 오류가 발생했습니다.')
    }
  }

  // 레시피 삭제
  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('정말 이 레시피를 보관함에서 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setRecipes((prev) => prev.filter((item) => item.id !== id))
      onRefresh()
    } catch (err: any) {
      console.error('레시피 삭제 에러:', err.message)
      alert('레시피 삭제 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-slate-50 rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl relative z-10">
        
        {/* 헤더 */}
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">나만의 레시피 보관함</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        {/* 본문 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-sky-500 mr-3"></div>
              <span>로딩 중...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <p>아직 저장된 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectRecipe(item.recipe_data)
                    onClose()
                  }}
                  className="group border border-zinc-200/80 hover:border-sky-400/50 bg-white hover:bg-sky-50/10 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(14,165,233,0.05)] transform hover:-translate-y-0.5 relative flex flex-col justify-between min-h-[200px] gap-4"
                >
                  <div>
                    {/* 요리 이름 노출 및 수정 인터페이스 */}
                    <div className="flex justify-between items-start pr-16">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold bg-white text-zinc-800"
                          />
                          <button
                            onClick={() => handleUpdateTitle(item.id)}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition duration-200"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs transition duration-205"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <h4 className="text-xs font-black text-zinc-850 group-hover:text-sky-700 transition-colors leading-relaxed line-clamp-1">
                            {item.recipe_data.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingId(item.id)
                              setEditTitle(item.recipe_data.title)
                            }}
                            className="text-[9px] font-bold text-sky-500 hover:text-sky-600 border border-sky-100 bg-sky-50 hover:bg-sky-100/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap"
                          >
                            변경
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => handleDeleteRecipe(item.id, e)}
                        className="text-zinc-405 hover:text-red-500 p-1 rounded transition-colors duration-200 absolute top-3.5 right-3.5 text-[10px] font-bold border border-zinc-200/60 bg-white shadow-sm hover:border-red-200 hover:bg-red-50"
                        title="레시피 삭제"
                      >
                        삭제
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.recipe_data.ingredientsUsed.slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="bg-slate-50 border border-zinc-200/60 px-2 py-0.5 rounded-md text-[9px] font-bold text-zinc-550">
                          {ing}
                        </span>
                      ))}
                      {item.recipe_data.ingredientsUsed.length > 3 && (
                        <span className="text-[8px] font-bold text-zinc-400 self-center">
                          +{item.recipe_data.ingredientsUsed.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 나만의 요리 메모 입력 공간 */}
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-amber-900 tracking-wider">
                        나만의 요리 메모
                      </label>
                      <button
                        onClick={() => handleSaveMemo(item.id)}
                        className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded font-bold transition shadow-sm cursor-pointer"
                      >
                        메모 저장
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="기록을 남겨보세요. (예: 간장 1스푼 추가 등)"
                      value={memoStates[item.id] || ''}
                      onChange={(e) =>
                        setMemoStates((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="w-full p-2 text-[10px] bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 resize-none font-semibold"
                    />
                  </div>

                  <div className="flex justify-between items-center mt-1 text-[9px] text-zinc-400 font-bold border-t border-zinc-100 pt-2.5">
                    <span className="flex items-center gap-1">소요 시간: {item.recipe_data.cookingTime}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-150 bg-zinc-50/30 text-center text-[10px] text-zinc-400 font-bold select-none">
          AI Chef Recipe Storage Dashboard
        </div>
      </div>
    </div>
  )
}
