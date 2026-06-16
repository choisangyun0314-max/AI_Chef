'use client'

import React from 'react'

interface Ingredient {
  id: number | string
  category: string
  sub_category: string
  name: string
}

interface BasketProps {
  selectedIngredients: Ingredient[]
  onRemoveIngredient: (ingredient: Ingredient) => void
  onCook: (style: string) => void
}

const COOKING_STYLES = [
  '일반 레시피',
  '매콤/얼큰하게',
  '아이용(안 맵게)',
  '다이어트/저염식',
  '간단한 술안주',
]

const getIngredientEmoji = (name: string, subCategory: string): string => {
  const n = name.toLowerCase()
  const s = subCategory.toLowerCase()

  if (n.includes('돼지') || n.includes('삼겹') || n.includes('목살') || n.includes('뒷다리')) return '🐷'
  if (n.includes('소고기') || n.includes('등심') || n.includes('안심') || n.includes('갈비') || n.includes('양지') || n.includes('사태')) return '🐮'
  if (n.includes('닭') || n.includes('계란') || n.includes('달걀')) {
    return n.includes('계란') || n.includes('달걀') ? '🥚' : '🐔'
  }
  if (n.includes('오징어') || n.includes('문어') || n.includes('낙지') || n.includes('주꾸미')) return '🐙'
  if (n.includes('새우')) return '🦐'
  if (n.includes('꽃게') || n.includes('대게')) return '🦀'
  if (n.includes('고등어') || n.includes('조기') || n.includes('광어') || n.includes('우럭') || n.includes('갈치') || n.includes('도미') || n.includes('꽁치') || n.includes('장어') || n.includes('멸치') || n.includes('삼치')) return '🐟'
  if (n.includes('전복') || n.includes('가리비') || n.includes('꼬막') || n.includes('홍합') || n.includes('바지락') || n.includes('골뱅이') || n.includes('소라')) return '🐚'
  
  if (s.includes('야채') || s.includes('채소')) {
    if (n.includes('마늘')) return '🧄'
    if (n.includes('양파')) return '🧅'
    if (n.includes('버섯')) return '🍄'
    if (n.includes('고추')) return '🌶️'
    if (n.includes('당근')) return '🥕'
    if (n.includes('감자') || n.includes('고구마')) return '🥔'
    if (n.includes('오이') || n.includes('호박')) return '🥒'
    if (n.includes('대파') || n.includes('쪽파') || n.includes('파')) return '🌱'
    if (n.includes('배추') || n.includes('양배추') || n.includes('상추')) return '🥬'
    return '🥦'
  }
  
  if (s.includes('과일')) {
    if (n.includes('사과')) return '🍎'
    if (n.includes('귤') || n.includes('오렌지')) return '🍊'
    if (n.includes('레몬')) return '🍋'
    if (n.includes('토마토')) return '🍅'
    return '🍎'
  }

  if (s.includes('해조류') || n.includes('미역') || n.includes('다시마') || n.includes('김')) return '🌿'
  if (n.includes('스팸') || n.includes('참치') || s.includes('통조림')) return '🥫'
  if (n.includes('소시지') || n.includes('베이컨') || n.includes('어묵') || n.includes('두부') || n.includes('김치') || n.includes('만두') || n.includes('떡')) {
    if (n.includes('두부')) return '⬜'
    if (n.includes('김치')) return '🌶️'
    if (n.includes('어묵')) return '🍢'
    if (n.includes('소시지')) return '🌭'
    if (n.includes('베이컨')) return '🥓'
    if (n.includes('만두')) return '🥟'
    if (n.includes('떡')) return '🍡'
    return '🍱'
  }

  if (n.includes('라면') || n.includes('파스타') || n.includes('소면') || n.includes('국수') || n.includes('빵') || n.includes('밥')) {
    if (n.includes('라면') || n.includes('소면') || n.includes('국수')) return '🍜'
    if (n.includes('파스타')) return '🍝'
    if (n.includes('빵')) return '🍞'
    if (n.includes('밥')) return '🍚'
    return '🌾'
  }

  if (s.includes('유제품') || n.includes('우유') || n.includes('치즈') || n.includes('요거트')) {
    if (n.includes('우유')) return '🥛'
    if (n.includes('치즈')) return '🧀'
    return '🥛'
  }

  if (s.includes('소스') || s.includes('양념')) {
    if (n.includes('참기름') || n.includes('굴소스') || n.includes('간장')) return '🍯'
    if (n.includes('소금') || n.includes('설탕') || n.includes('후추') || n.includes('깨')) return '🧂'
    return '🍯'
  }

  return '🥗'
}

export default function Basket({ selectedIngredients, onRemoveIngredient, onCook }: BasketProps) {
  const isEmpty = selectedIngredients.length === 0
  const [selectedStyle, setSelectedStyle] = React.useState('일반 레시피')

  return (
    <div className="relative w-full max-w-xs h-[680px] bg-amber-50/90 rounded-3xl p-6 border border-amber-200 shadow-[0_15px_35px_rgba(245,158,11,0.05)] overflow-hidden flex flex-col justify-between">
      {/* Decorative warm glow auras */}
      <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-amber-200/30 blur-[80px]" />
      <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full bg-orange-200/20 blur-[80px]" />

      {/* Header section */}
      <div className="border-b border-amber-200 pb-3.5 mb-4 z-10 flex items-center justify-between">
        <h3 className="text-sm font-black text-amber-900 tracking-wider flex items-center gap-2 select-none">
          <span>요리 바구니</span>
          <span className="bg-amber-200 text-amber-800 border border-amber-300/60 font-bold text-[10px] font-mono px-2.5 py-0.5 rounded-full shadow-[0_1px_5px_rgba(245,158,11,0.1)]">
            {selectedIngredients.length}
          </span>
        </h3>
      </div>

      {/* Selected Ingredients List Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 z-10 custom-scrollbar">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 select-none">
            <p className="text-xs text-amber-600/70 leading-relaxed font-semibold">
              냉장고를 열고<br />
              재료를 바구니에 담아보세요!
            </p>
          </div>
        ) : (
          selectedIngredients.map((ing) => {
            const emoji = getIngredientEmoji(ing.name, ing.sub_category)
            return (
              <div
                key={ing.id}
                onClick={() => onRemoveIngredient(ing)}
                className="group flex justify-between items-center bg-white border border-amber-100 hover:border-red-400/40 px-3.5 py-2.5 rounded-2xl transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_2px_8px_rgba(239,68,68,0.06)] transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-300">
                    {emoji}
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 group-hover:text-zinc-900">
                    {ing.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveIngredient(ing)
                  }}
                  className="text-zinc-400 hover:text-red-500 text-xs p-1 font-bold transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* 요리 스타일 필터 UI 추가 */}
      <div className="mb-4 z-10">
        <label className="text-[11px] font-black text-amber-900 block mb-2 tracking-wider">요리 스타일 선택</label>
        <div className="flex flex-wrap gap-1.5">
          {COOKING_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedStyle === style
                  ? 'bg-amber-600 border-amber-700 text-white shadow-sm font-black'
                  : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-100/50'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Cook/Submit Button */}
      <div className="mt-4 pt-3 border-t border-amber-200 z-10">
        <button
          onClick={() => onCook(selectedStyle)}
          disabled={isEmpty}
          className={`w-full py-4 rounded-2xl font-bold text-xs tracking-wider uppercase shadow-md transition-all duration-300 ${
            isEmpty
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300/40'
              : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-black shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_18px_rgba(245,158,11,0.3)] transform hover:-translate-y-0.5 active:scale-95'
          }`}
        >
          AI 레시피 만들기
        </button>
      </div>
    </div>
  )
}
