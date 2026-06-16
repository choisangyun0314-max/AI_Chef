'use client'

import React, { useState } from 'react'

export interface Ingredient {
  id: number | string // 직접 추가된 재료는 string 형태의 ID를 가질 수 있도록 허용
  category: string
  sub_category: string
  name: string
}

interface RefrigeratorProps {
  ingredients: Ingredient[]
  selectedIngredients: Ingredient[]
  onToggleIngredient: (ingredient: Ingredient) => void
}

// 소분류(sub_category)별 대표 이모지 매핑
const subCategoryIcons: Record<string, string> = {
  '야채': '🥕',
  '과일': '🍎',
  '해조류': '🌿',
  '돼지고기': '🐖',
  '소고기': '🐄',
  '닭고기': '🐓',
  '어패류': '🐟',
  '통조림': '🥫',
  '가공식품': '🍳',
  '유제품': '🥛',
  '소스/양념': '🧂',
  '직접 추가': '📝', // 직접 추가한 재료용 아이콘
}

export default function Refrigerator({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
}: RefrigeratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'식물성' | '동물성' | '기타'>('식물성')
  const [searchQuery, setSearchQuery] = useState('') // 검색어 상태

  // 1. 검색어에 따라 식재료 필터링 (대분류 탭에 구애받지 않고 전체에서 검색되도록 처리)
  const isSearching = searchQuery.trim().length > 0

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (isSearching) return matchesSearch // 검색 중일 때는 탭 무시하고 검색 결과만
    return matchesSearch && ing.category === activeTab // 평소에는 탭 필터링 적용
  })

  // 2. 소분류(sub_category)별로 그룹화
  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    if (!acc[ing.sub_category]) acc[ing.sub_category] = []
    acc[ing.sub_category].push(ing)
    return acc
  }, {} as Record<string, Ingredient[]>)

  // 3. 사용자가 입력한 재료를 바구니에 직접 추가하는 함수
  const handleAddCustomIngredient = () => {
    if (!searchQuery.trim()) return

    // 이미 등록되어 있거나 이미 바구니에 있는 이름인지 검증
    const trimmedName = searchQuery.trim()
    const isExist = selectedIngredients.some((ing) => ing.name === trimmedName)
    
    if (isExist) {
      alert('이미 바구니에 있거나 목록에 존재하는 재료입니다.')
      return
    }

    const customItem: Ingredient = {
      id: `custom-${Date.now()}`, // 중복 없는 임시 ID 생성
      category: '기타',
      sub_category: '직접 추가',
      name: trimmedName,
    }

    onToggleIngredient(customItem) // 바구니에 추가
    setSearchQuery('') // 입력창 초기화
  }

  return (
    <div 
      className="relative w-full max-w-xl h-[680px] bg-zinc-200 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-zinc-350/80 overflow-visible"
      style={{ perspective: '1500px' }}
    >
      {/* --- CLOSED REFRIGERATOR DOOR (SILVER/WHITE SMART FRIDGE STYLE) --- */}
      <div
        onClick={() => setIsOpen(true)}
        className={`absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-250 z-20 p-8 flex flex-col justify-between cursor-pointer rounded-3xl border border-zinc-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_10px_25px_rgba(0,0,0,0.05)] transition-all duration-700 origin-left ${
          isOpen ? '[transform:rotateY(-105deg)] opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Soft brushed metal highlights */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 rounded-3xl pointer-events-none" />

        {/* Smart fridge display screen */}
        <div className="w-48 bg-white/95 border border-zinc-200/80 rounded-2xl p-4 text-[10px] text-zinc-800 font-mono shadow-[inset_0_2px_6px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-1.5 select-none pointer-events-none">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-1.5 text-zinc-400">
            <span>SMART PANEL</span>
            <span className="animate-pulse text-cyan-600 font-bold">● ON</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-zinc-500 font-medium">FREEZER</span>
            <span className="font-bold text-zinc-700">-18°C</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-medium">FRIDGE</span>
            <span className="font-bold text-cyan-600">2°C</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center">
            <span className="text-cyan-600 font-bold">RECIPE HELPER</span>
            <span className="bg-cyan-50 text-cyan-600 text-[8px] px-1.5 py-0.5 rounded font-bold">READY</span>
          </div>
        </div>

        {/* Silver Handle bar */}
        <div className="w-3.5 h-36 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border border-zinc-250 rounded-full absolute right-3 top-1/3 shadow-[0_4px_10px_rgba(0,0,0,0.08)] flex items-center justify-center">
          <div className="w-1.5 h-4/5 bg-white/40 rounded-full" />
        </div>

        {/* Footer text */}
        <div className="flex flex-col gap-1 mt-auto">
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">
            나의 AI 냉장고
          </h2>
          <p className="text-xs text-cyan-600 font-bold tracking-wide animate-pulse">
            클릭하여 냉장고 열기 / Click to Open
          </p>
        </div>

        <div className="text-right text-zinc-400 text-[9px] font-mono mt-4">
          Powered by Gemini 3.5 Flash
        </div>
      </div>

      {/* --- OPENED REFRIGERATOR INTERIOR (LIGHT FRESH GLOW) --- */}
      <div className={`absolute inset-0 h-full p-6 flex flex-col bg-gradient-to-b from-sky-50/20 via-zinc-50 to-zinc-100 rounded-3xl z-10 border border-zinc-300 shadow-[inset_0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Bright white LED light strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white blur-[0.5px] shadow-[0_1px_8px_rgba(14,165,233,0.25)]" />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-sky-200/10 via-transparent to-transparent pointer-events-none" />

        {/* Header Controls */}
        <div className="flex justify-between items-center mb-3 z-10">
          <h3 className="text-sm font-black text-zinc-800 tracking-wider">식재료를 선택하세요</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800 px-3 py-1.5 rounded-xl transition border border-zinc-300/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            냉장고 문 닫기
          </button>
        </div>

        {/* 🔍 검색창 영역 */}
        <div className="mb-4 z-10">
          <input
            type="text"
            placeholder="찾으시는 식재료를 검색해보세요 (예: 파, 닭)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-zinc-800 transition-all duration-300"
          />
        </div>

        {/* 대분류 탭 (검색 중이 아닐 때만 노출) */}
        {!isSearching && (
          <div className="flex gap-1.5 mb-4 z-10">
            {(['식물성', '동물성', '기타'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-[0_3px_12px_rgba(14,165,233,0.3)] font-bold'
                    : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                }`}
              >
                {tab === '식물성' ? '식물성' : tab === '동물성' ? '동물성' : '기타'}
              </button>
            ))}
          </div>
        )}

        {/* Ingredients Scrollable Shelf Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 z-10 custom-scrollbar">
          {/* 검색 결과가 없을 때 보여줄 화면 및 직접 추가 버튼 */}
          {Object.keys(groupedIngredients).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center gap-4">
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                &ldquo;{searchQuery}&rdquo; 관련 재료를 냉장고에서 찾지 못했어요.
              </p>
              <button
                onClick={handleAddCustomIngredient}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-[0_2px_8px_rgba(245,158,11,0.2)] transition duration-300 transform hover:-translate-y-0.5 active:scale-95"
              >
                바구니에 &apos;{searchQuery}&apos; 직접 추가하기
              </button>
            </div>
          )}

          {/* 정상 리스트 출력 */}
          {Object.entries(groupedIngredients).map(([subCategory, items]) => (
            <div 
              key={subCategory} 
              className="bg-white border border-zinc-200/60 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              {/* 소분류 타이틀에만 대표 이모지 노출 📌 */}
              <h4 className="text-xs font-bold text-zinc-700 mb-3 flex items-center gap-1.5 border-b border-zinc-150 pb-1.5 tracking-wider">
                <span className="text-sm filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                  {subCategoryIcons[subCategory] || '📦'}
                </span>
                {subCategory}
              </h4>
              
              {/* 개별 아이템 그리드 */}
              <div className="grid grid-cols-3 gap-2">
                {items.map((ing) => {
                  const isSelected = selectedIngredients.some((selected) => selected.id === ing.id)
                  
                  return (
                    <button
                      key={ing.id}
                      onClick={() => onToggleIngredient(ing)}
                      className={`py-2.5 px-2 text-[11px] rounded-xl border text-center transition-all duration-300 min-h-[42px] flex items-center justify-center font-medium active:scale-95 group select-none ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-[0_2px_8px_rgba(16,185,129,0.2)] scale-[0.98]'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-white hover:border-zinc-350 hover:text-zinc-900 hover:shadow-sm'
                      }`}
                    >
                      <span className="truncate w-full leading-tight">{ing.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
