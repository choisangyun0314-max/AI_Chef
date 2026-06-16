# AI-Chef 서비스 개발 프롬프트


### 식재료 엑셀 파일 정리 및 csv 변환

> category, sub-category, name 추가
---
### supabase에 ingredients 테이블 생성

---
### supabase Project URL, Publishable Key 복사

> NEXT_PUBLIC_SUPABASE_URL=your_SUPABASE_URL
> NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_SUPABASE_PUBLISHABLE_KEY
> NEXT_PUBLIC_SUPABASE_ANON_KEY=your_SUPABASE_ANON_KEY
> SUPABASE_SERVICE_ROLE_KEY=your_SERVICE_ROLE_KEY
---
### 빈 폴더를 생성하고 project로 이름을 변경

---
### 터미널을 열고 코드 베이스 구성

> npx create-next-app@latest .
---
### 코드 수정

- readme.md 파일 내용 삭제
- next.config.ts 수정
- app/layout.tsx의 title, description 수정
---
### supabase 연결을 위한 패키지 설치

터미널에서

> npm install @supabase/supabase-js @supabase/ssr
---
### supabase 키를 환경 변수 파일에 등록

.env.local 파일을 만들고 아래 키를 등록

> NEXT_PUBLIC_SUPABASE_URL=your_SUPABASE_URL
> NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_SUPABASE_PUBLISHABLE_KEY
> NEXT_PUBLIC_SUPABASE_ANON_KEY=your_SUPABASE_ANON_KEY
> SUPABASE_SERVICE_ROLE_KEY=your_SERVICE_ROLE_KEY
---
### supabase 초기화 파일 제작

프롬프트:

1. 필요한 파일
> lib/supabase/server.ts : 서버 컴포넌트용 supabase 클라이언트 (createClient)
> lib/supabase/client.ts : 클라이언트 컴포넌트용 supabase 클라이언트 (createClient)

2. 아래 패키지가 이미 설치됨
> @supabase/supabase-js
> @supabase/ssr

3. 환경변수에 supabase 키가 추가되어 있음
> NEXT_PUBLIC_SUPABASE_URL
> NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
> NEXT_PUBLIC_SUPABASE_ANON_KEY
> SUPABASE_SERVICE_ROLE_KEY

이외 화면이나 로직은 수정하지 말고, 필요한 초기화 코드만 작성

---
### supabase 연결 확인

프롬프트:

> supabase 연결을 확인하고 등록된 테이블 정보를 알려줘
> ingredients 테이블 정보를 자세히 알려줘
---
### clonecn skill 설치

> npx skills add hunvreus/clonecn --skill clonecn
---
### 메인페이지 구성 (1)

프롬프트:

> 냉장고를 클릭해 열고, 식재료를 선택해 바구니에 담는 핵심 UI와 상태 관리를 처리하는 메인 페이지 코드를 구성해 봤어.
> 1. app/components/Refrigerator.tsx (냉장고 내부 및 문 애니메이션)
> 2. app/components/Basket.tsx (선택된 재료 바구니 및 요리하기 버튼)


---
### 메인페이지 구성 (2)

#### 핵심 코드 작성

1. Refrigerator 컴포넌트 (app/components/Refrigerator.tsx)

```
'use client';

import React, { useState } from 'react';

// 외부에서 전달받을 Props 타입 정의
interface Ingredient {
  id: number;
  category: string;
  sub_category: string;
  name: string;
}

interface RefrigeratorProps {
  ingredients: Ingredient[];
  selectedIngredients: Ingredient[];
  onToggleIngredient: (ingredient: Ingredient) => void;
}

export default function Refrigerator({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
}: RefrigeratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'식물성' | '동물성' | '기타'>('식물성');

  // 현재 선택된 탭의 대분류 데이터만 필터링
  const filteredIngredients = ingredients.filter((ing) => ing.category === activeTab);

  // 소분류(sub_category)별로 그룹화
  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    if (!acc[ing.sub_category]) acc[ing.sub_category] = [];
    acc[ing.sub_category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="relative w-full max-w-xl h-[650px] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700">
      
      {/* 닫힌 냉장고 문 (isOpen이 true일 때 Y축 기준으로 회전하며 열림) */}
      <div
        onClick={() => setIsOpen(true)}
        className={`absolute inset-0 bg-sky-100 z-10 p-8 flex flex-col justify-between cursor-pointer transition-transform duration-700 origin-left border-r-4 border-sky-200 shadow-inner ${
          isOpen ? '[transform:rotateY(-105deg)] pointer-events-none' : ''
        }`}
      >
        <div>
          <div className="w-12 h-24 bg-slate-400 rounded-r-xl absolute right-0 top-1/3 shadow-md" />
          <h2 className="text-2xl font-bold text-slate-700">나의 AI 냉장고</h2>
          <p className="text-sm text-slate-500 mt-2">클릭하면 냉장고가 열립니다.</p>
        </div>
        <div className="text-center text-slate-400 text-xs">🤖 Gemini 1.5 Flash-Lite Powered</div>
      </div>

      {/* 열린 냉장고 내부 상태 */}
      <div className="h-full p-6 flex flex-col bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">식재료를 선택하세요</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-full text-slate-600 transition"
          >
            냉장고 닫기
          </button>
        </div>

        {/* 대분류 탭 스위치 */}
        <div className="flex gap-2 mb-4">
          {(['식물성', '동물성', '기타'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 식재료 그리드 영역 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {Object.entries(groupedIngredients).map(([subCategory, items]) => (
            <div key={subCategory} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 border-b pb-1">{subCategory}</h4>
              <div className="grid grid-cols-3 gap-2">
                {items.map((ing) => {
                  const isSelected = selectedIngredients.some((selected) => selected.id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => onToggleIngredient(ing)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition truncate ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

2. Basket 컴포넌트 (app/components/Basket.tsx)

```
'use client';

import React from 'react';

interface Ingredient {
  id: number;
  category: string;
  sub_category: string;
  name: string;
}

interface BasketProps {
  selectedIngredients: Ingredient[];
  onRemoveIngredient: (ingredient: Ingredient) => void;
  onCook: () => void;
}

export default function Basket({ selectedIngredients, onRemoveIngredient, onCook }: BasketProps) {
  return (
    <div className="w-full max-w-xs bg-amber-50 rounded-3xl p-6 border-4 border-amber-200 shadow-lg flex flex-col h-[650px]">
      <div className="border-b-2 border-amber-200 pb-3 mb-4">
        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
          🧺 요리 바구니
          <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">
            {selectedIngredients.length}
          </span>
        </h3>
      </div>

      {/* 담긴 재료 리스트 */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {selectedIngredients.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-amber-600/60 p-4">
            냉장고를 열고<br />재료를 바구니에 담아보세요!
          </div>
        ) : (
          selectedIngredients.map((ing) => (
            <div
              key={ing.id}
              className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-amber-100 shadow-sm"
            >
              <span className="text-sm font-medium text-slate-700">{ing.name}</span>
              <button
                onClick={() => onRemoveIngredient(ing)}
                className="text-slate-400 hover:text-rose-500 text-xs p-1 font-bold transition"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* 요리하기 버튼 */}
      <button
        onClick={onCook}
        disabled={selectedIngredients.length === 0}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all ${
          selectedIngredients.length === 0
            ? 'bg-slate-300 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98'
        }`}
      >
        🍳 AI 레시피 만들기
      </button>
    </div>
  );
}
```

3. 메인 페이지 구성 (app/page.tsx)

```
'use client';

import React, { useState } from 'react';
import Refrigerator from './components/Refrigerator';
import Basket from './components/Basket';

// 임시 데이터 (나중에 Supabase DB 연동 후 대체할 영역)
const mockIngredients = [
  { id: 1, category: '식물성', sub_category: '야채', name: '상추' },
  { id: 7, category: '식물성', sub_category: '야채', name: '양파' },
  { id: 8, category: '식물성', sub_category: '야채', name: '마늘' },
  { id: 54, category: '동물성', sub_category: '돼지고기', name: '삼겹살' },
  { id: 67, category: '동물성', sub_category: '닭고기', name: '계란' },
  { id: 104, category: '기타', sub_category: '가공식품', name: '두부' },
  { id: 111, category: '기타', sub_category: '가공식품', name: '김치' },
  { id: 118, category: '기타', sub_category: '소스/양념', name: '간장' },
];

interface Ingredient {
  id: number;
  category: string;
  sub_category: string;
  name: string;
}

export default function Home() {
  // 실제 개발 시에는 Supabase에서 가져온 데이터를 이 상태에 넣음
  const [ingredients] = useState<Ingredient[]>(mockIngredients); 
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);

  // 식재료 선택 토글 함수
  const handleToggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
      prev.some((item) => item.id === ingredient.id)
        ? prev.filter((item) => item.id !== ingredient.id)
        : [...prev, ingredient]
    );
  };

  // AI 요리하기 버튼 액션
  const handleCook = () => {
    const ingredientNames = selectedIngredients.map((i) => i.name);
    alert(`선택된 재료 [${ingredientNames.join(', ')}]로 Gemini 레시피 생성을 요청합니다!`);
    // TODO: 다음 단계에서 여기에 API Route 호츌 로직 작성 예정
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 gap-6">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          🧑‍🍳 AI Chef : 냉장고를 부탁해
        </h1>
        <p className="text-slate-500 mt-1">남은 식재료를 골라 맞춤형 레시피를 제안받으세요.</p>
      </header>

      {/* 중앙 메인 컨텐츠 영역 */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
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
    </main>
  );
}
```
코드 작성 후 체크 사항
> 1. 위의 파일들을 구조에 맞게 복사한 뒤 npm run dev로 로컬 서버를 켜봐.
> 2. 메인 페이지에서 냉장고를 클릭했을 때 3D 회전하듯 부드럽게 열리는지 확인해 보고, 재료를 누르면 바구니에 정상적으로 담기는지 테스트해 봐.

---
### 메인 페이지 구성 (3)

프롬프트:

> app/page.tsx 코드를 아래와 같이 수정해 줘. useEffect를 사용해 컴포넌트가 마운트될 때 Supabase의 ingredients 테이블에서 데이터를 안전하게 가져오도록 변경했어.

```
'use client';

import React, { useState, useEffect } from 'react';
import Refrigerator from './components/Refrigerator';
import Basket from './components/Basket';
// 이전에 세팅해 둔 Supabase 클라이언트 불러오기
import { supabase } from '@/lib/supabase/client';

interface Ingredient {
  id: number;
  category: string;
  sub_category: string;
  name: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 컴포넌트 로드 시 Supabase에서 식재료 데이터 가져오기
  useEffect(() => {
    async function fetchIngredients() {
      try {
        setIsLoading(true);
        // ingredients 테이블의 모든 행을 id 순으로 정렬해서 가져옴
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          setIngredients(data as Ingredient[]);
        }
      } catch (error) {
        console.error('식재료를 불러오는 중 오류가 발생했습니다:', error);
        alert('데이터베이스 연결 실패. 테이블 이름을 확인해 주세요!');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIngredients();
  }, []);

  // 식재료 선택 토글 함수
  const handleToggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
      prev.some((item) => item.id === ingredient.id)
        ? prev.filter((item) => item.id !== ingredient.id)
        : [...prev, ingredient]
    );
  };

  // AI 요리하기 버튼 액션
  const handleCook = () => {
    const ingredientNames = selectedIngredients.map((i) => i.name);
    alert(`선택된 재료 [${ingredientNames.join(', ')}]로 Gemini 레시피 생성을 요청합니다!`);
    // TODO: 다음 단계에서 여기에 API Route 호출 로직 작성 예정
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 gap-6">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          🧑‍🍳 AI Chef : 냉장고를 부탁해
        </h1>
        <p className="text-slate-500 mt-1">남은 식재료를 골라 맞춤형 레시피를 제안받으세요.</p>
      </header>

      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[650px] w-full max-w-4xl bg-white/50 rounded-3xl border border-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-slate-600 font-medium">냉장고 채우는 중...</p>
        </div>
      ) : (
        /* 데이터 로드가 끝나면 보여줄 메인 컨텐츠 영역 */
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
          {/* 왼쪽: 냉장고 (Supabase에서 가져온 진짜 데이터 주입) */}
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
    </main>
  );
}
```

---
### 메인 페이지 구성 (4)

구현 아이디어
1. 식재료 검색 (Filter): 사용자가 검색창에 단어를 치면, 135개 재료 중 일치하는 재료만 실시간으로 필터링해서 보여준다.
2. 커스텀 재료 추가 (Custom Input): 만약 검색 결과가 없다면, "[입력한 단어] 추가하기" 버튼을 띄워서 데이터베이스에 없더라도 즉시 바구니에 담을 수 있게 한다. 이 커스텀 재료는 임시 ID(예: Date.now())와 category: '기타', sub_category: '직접 추가'를 부여해서 처리한다.

프롬프트:

> 검색창과 직접 추가 로직을 더해 한층 강력해진 냉장고 컴포넌트 전체 코드야. 기존 코드를 이 내용으로 덮어씌워 줘.

```
'use client';

import React, { useState } from 'react';

interface Ingredient {
  id: number | string; // 직접 추가된 재료는 string 형태의 ID를 가질 수 있도록 허용
  category: string;
  sub_category: string;
  name: string;
}

interface RefrigeratorProps {
  ingredients: Ingredient[];
  selectedIngredients: Ingredient[];
  onToggleIngredient: (ingredient: Ingredient) => void;
}

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
};

export default function Refrigerator({
  ingredients,
  selectedIngredients,
  onToggleIngredient,
}: RefrigeratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'식물성' | '동물성' | '기타'>('식물성');
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태

  // 1. 검색어에 따라 식재료 필터링 (대분류 탭에 구애받지 않고 전체에서 검색되도록 처리)
  const isSearching = searchQuery.trim().length > 0;
  
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (isSearching) return matchesSearch; // 검색 중일 때는 탭 무시하고 검색 결과만
    return matchesSearch && ing.category === activeTab; // 평소에는 탭 필터링 적용
  });

  // 2. 소분류(sub_category)별로 그룹화
  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    if (!acc[ing.sub_category]) acc[ing.sub_category] = [];
    acc[ing.sub_category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // 3. 사용자가 입력한 재료를 바구니에 직접 추가하는 함수
  const handleAddCustomIngredient = () => {
    if (!searchQuery.trim()) return;

    // 이미 등록되어 있거나 이미 바구니에 있는 이름인지 검증
    const trimmedName = searchQuery.trim();
    const isExist = selectedIngredients.some((ing) => ing.name === trimmedName);
    
    if (isExist) {
      alert('이미 바구니에 있거나 목록에 존재하는 재료입니다.');
      return;
    }

    const customItem: Ingredient = {
      id: `custom-${Date.now()}`, // 중복 없는 임시 ID 생성
      category: '기타',
      sub_category: '직접 추가',
      name: trimmedName,
    };

    onToggleIngredient(customItem); // 바구니에 추가
    setSearchQuery(''); // 입력창 초기화
  };

  return (
    <div className="relative w-full max-w-xl h-[650px] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700">
      
      {/* 닫힌 냉장고 문 */}
      <div
        onClick={() => setIsOpen(true)}
        className={`absolute inset-0 bg-sky-50 z-10 p-8 flex flex-col justify-between cursor-pointer transition-transform duration-700 origin-left border-r-4 border-sky-100 shadow-inner ${
          isOpen ? '[transform:rotateY(-105deg)] pointer-events-none' : ''
        }`}
      >
        <div>
          <div className="w-12 h-24 bg-slate-400 rounded-r-xl absolute right-0 top-1/3 shadow-md" />
          <h2 className="text-2xl font-bold text-slate-700">나의 AI 냉장고</h2>
          <p className="text-sm text-slate-500 mt-2">클릭하면 냉장고가 열립니다.</p>
        </div>
        <div className="text-center text-slate-400 text-xs">🤖 Gemini 1.5 Flash-Lite Powered</div>
      </div>

      {/* 열린 냉장고 내부 */}
      <div className="h-full p-6 flex flex-col bg-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-slate-800">식재료를 선택하세요</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-slate-300 hover:bg-slate-400 px-3 py-1 rounded-full text-slate-700 font-medium transition"
          >
            냉장고 닫기
          </button>
        </div>

        {/* 🔍 검색창 영역 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="찾으시는 식재료를 검색해보세요 (예: 파, 닭)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300/80 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-slate-800"
          />
        </div>

        {/* 대분류 탭 (검색 중이 아닐 때만 노출하여 인지 과부하 방지) */}
        {!isSearching && (
          <div className="flex gap-2 mb-4">
            {(['식물성', '동물성', '기타'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                  activeTab === tab
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* 식재료 리스트 및 검색 결과 영역 */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 검색 결과가 없을 때 보여줄 화면 및 직접 추가 버튼 */}
          {Object.keys(groupedIngredients).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 text-sm mb-4">
                &ldquo;{searchQuery}&rdquo; 관련 재료를 냉장고에서 찾지 못했어요.
              </p>
              <button
                onClick={handleAddCustomIngredient}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                ➕ 바구니에 &apos;{searchQuery}&apos; 직접 추가하기
              </button>
            </div>
          )}

          {/* 정상 리스트 출력 */}
          {Object.entries(groupedIngredients).map(([subCategory, items]) => (
            <div key={subCategory} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>{subCategoryIcons[subCategory] || '📦'}</span>
                {subCategory}
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                {items.map((ing) => {
                  const isSelected = selectedIngredients.some((selected) => selected.id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => onToggleIngredient(ing)}
                      className={`py-2.5 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-sm scale-[0.98]'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---
### AI 세팅

AI 툴킷 설치

```
npm install ai @ai-sdk/react @ai-sdk/google zod
```

Gemini API 키 발급 방법

1. Google AI Studio 접속

> https://aistudio.google.com/app/apikey

2. API 키 생성

> 1. "Create API key" 버튼 클릭
> 2. 기존 Google Cloud 프로젝트 선택 또는 새로 생성
> 3. API 키 복사

3. .env.local에 추가

> NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

4. 서버 재시작

터미널에서 개발 서버 중지 후 다시 시작:

```
# Ctrl+C로 중지
npm run dev
```

---
### AI 기능 추가 (1)

#### Gemini API 라우터 작성

> 파일 위치: app/api/recipe/route.ts

```
import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: '선택된 식재료가 없습니다.' },
        { status: 400 }
      );
    }

    // 💡 1. Gemini가 반환해야 할 레시피 데이터 구조를 Zod로 엄격하게 정의
    const recipeSchema = z.object({
      title: z.string().describe('요리의 이름 (예: 매콤 달콤 제육볶음)'),
      difficulty: z.enum(['초급', '중급', '고급']).describe('요리 난이도'),
      cookingTime: z.string().describe('소요 시간 (예: 20분)'),
      ingredientsUsed: z.array(z.string()).describe('사용자가 제시한 재료 중 실제 요리에 사용된 주재료 목록'),
      basicPantry: z.array(z.string()).describe('소금, 설탕, 물 등 사용자가 기본적으로 가지고 있다고 가정한 양념 및 부재료 목록'),
      steps: z.array(z.string()).describe('순서대로 명확하게 작성된 상세 조리 과정'),
      chefTip: z.string().describe('요리를 더 맛있게 만들 수 있는 신의 한 수 꿀팁'),
    });

    // 💡 2. Vercel AI SDK를 이용해 Gemini 호출
    const { object: recipeData } = await generateObject({
      model: google('gemini-1.5-flash'), // Vercel AI SDK가 지원하는 최신 경량 플래시 엔진 지정
      schema: recipeSchema,
      system: `당신은 사용자의 냉장고 속에 남은 식재료를 활용해 최고의 요리를 제안하는 전문 AI 셰프입니다.
      주어진 재료를 최대한 활용하되, 현실적이고 집에서 따라 하기 쉬운 매력적인 레시피 '딱 한 가지'만 생성해야 합니다.
      기본적인 조미료나 물 등은 사용자의 주방에 구비되어 있다고 가정해도 좋습니다.`,
      prompt: `사용자가 가진 식재료 목록: [${ingredients.join(', ')}]
      이 재료들을 조합하여 가장 맛있는 요리 레시피를 정의된 스키마 구조에 맞춰 생성해 주세요.`,
    });

    // 구조화된 완벽한 JSON 데이터를 프론트엔드로 반환
    return NextResponse.json(recipeData);
  } catch (error) {
    console.error('Gemini SDK 에러 발생:', error);
    return NextResponse.json(
      { error: '레시피를 생성하는 중에 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

---
### AI 기능 추가 (2)

#### 프론트엔드 마크다운 파일 변환 및 다운로드 프롬프트

```
// 메인 페이지 내부에서 사용할 타입 정의
interface RecipeData {
  title: string;
  difficulty: '초급' | '중급' | '고급';
  cookingTime: string;
  ingredientsUsed: string[];
  basicPantry: string[];
  steps: string[];
  chefTip: string;
}

// ... 기존 상태 관리 코드 생략 ...
const [recipe, setRecipe] = useState<RecipeData | null>(null);

// 📥 클라이언트 사이드에서 JSON을 깔끔한 마크다운 문서로 변환해 주는 함수
const handleDownloadMarkdown = () => {
  if (!recipe) return;

  // JSON 데이터를 기반으로 이쁜 마크다운 서식 조립 (프롬프트 템플릿 역할)
  const markdownContent = `---
### 📝 추천 요리: ${recipe.title}
- **난이도:** ${recipe.difficulty}
- **소요 시간:** ${recipe.cookingTime}

#### 🛒 준비 재료
- **선택한 재료:** ${recipe.ingredientsUsed.join(', ')}
- **기본 양념:** ${recipe.basicPantry.join(', ')}

#### 👩‍🍳 조리 순서
${recipe.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

#### 💡 셰프의 꿀팁
- ${recipe.chefTip}
---`;

  // 파일 다운로드 실행
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${recipe.title.replace(/\s+/g, '_')}_레시피.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---
### 구글 로그인 구성 (1)

프롬프트:

> 메인 페이지 오른쪽 상단에 로그인 링크를 만들어.
> 로그인 링크를 누르면 다른 페이지로 이동하지 않도록 해.
---
### 구글 로그인 구성 (2)

프롬프트:

> app 폴더 밑에 auth 폴더를 만들고 이 안에 page.tsx 파일을 만들어.
> 로그인 링크를 누르면 로그인 팝업이 나타나서 로그인을 할 수 있도록 하려고 해.
> auth 페이지에 로그인 디자인만 우선 구현해주면 돼.
> 메인 페이지 디자인 컨셉을 유지하면서 구현해.
> 단, 로그인과 회원가입을 구분할 필요는 없어. 필요한 건 단지 google 로그인 뿐이야.
> 로그인 창에 상단에 Mascot.jpg 이미지를 배치해.
---
### 구글 로그인 구성 (3)

supabase와 google cloud console에서 구글 인증에 필요한 설정 진행

1. supabase 접속
2. 프로젝트 메뉴에서 **[Authentication]-[Sign In / Providers]** 클릭
3. Google 클릭 후 Client IDs와 Client Secret (for OAuth) 입력을 위해
4. google cloud console에 접속하여 'AI chef'란 이름의 새 프로젝트 생성
5. AI chef 프로젝트로 이동한 다음, **[API 및 서비스]** 클릭
6. **[API 및 서비스]** 에 있는 **[사용자 인증 정보]** 클릭
7. **[+사용자 인증 정보 만들기]-[OAuth 클라이언트 ID]** 클릭하여 프로젝트 구성
	- 클라이언트 ID: your-google-client-id
	- 클라이언트 비밀번호: your-google-client-secret

8. supabase 창에 클라이언트 ID와 클라이언트 비밀번호를 입력
---
### 구글 로그인 구성 (4)

프롬프트:

> supabase 를 활용해서 auth 페이지에 구글 로그인을 구현하자.
> 현재 프로젝트에서 전역으로 로그인 상태를 관리하기 위해 Authcontext를 설정하자.
> supabase auth로 로그인 된 사용자를 바로 데이터베이스에 저장하기 위해 users 테이블을 생성하고, 자동으로 연동되게 하자.
> 로그인이 이루어지면 메인 페이지로 이동하자.
> 로그인이 되었으면 '로그인' 링크는 사용자 프로필을 팝오버 형태로 구현하자. 사용자 프로필 사진이 보이고, 호버 시 아래에 signout이 보이도록 하자.

- Authcontext: 특정 상태를 프로젝트 전체에서 언제든 확인 가능하도록 공유 기능. 어떤 페이지에서든 로그인 상태인가를 간편하게 확인 가능
---
### 레시피 저장 기능 구현 (1): 레시피 저장 로직 최종 업데이트

프롬프트:

> app/page.tsx 내의 저장 함수 부분을 아래와 같은 느낌으로 매핑해줘.

```
// 💡 작성해 둔 AuthContext에서 유저 정보와 로그인 여부 가져오기 (예시 명칭)
const { user } = useAuth(); 

const handleSaveRecipe = async () => {
  if (!user) {
    alert('구글 로그인을 하시면 마음에 드는 레시피를 저장할 수 있습니다!');
    return;
  }
  if (!recipe) return; // Gemini가 생성한 JSON 객체 데이터

  try {
    // Supabase의 saved_recipes 테이블에 insert 실행
    const { error } = await supabase.from('saved_recipes').insert({
      user_id: user.id, // AuthContext에서 꺼내온 실제 구글 유저 UUID
      recipe_data: recipe, // 구조화된 레시피 데이터 객체 통째로 저장
    });

    if (error) throw error;
    alert('❤️ 나만의 레시피 보관함에 성공적으로 저장되었습니다!');
  } catch (error) {
    console.error('레시피 저장 에러:', error);
    alert('레시피를 저장하는 중 오류가 발생했습니다.');
  }
};
```

---
### 레시피 저장 기능 구현 (2): 저장된 레시피 불러오기 팝업/모달

프롬프트:

> 유저가 저장한 레시피 리스트를 확인할 수 있도록, 프로필 팝오버 메뉴에 [보관함 보기] 링크를 추가하고 이를 누르면 내가 저장한 레시피들이 팝업으로 뜨는 컴포넌트를 만들면 아주 깔끔할 거야.

```
// 로그인한 유저 본인의 레시피만 안전하게 select (RLS가 걸려있어 안전함)
const { data, error } = await supabase
  .from('saved_recipes')
  .select('*')
  .order('created_at', { ascending: false });
```

---
### 레시피 저장 기능 구현 (3)
####구현 설계

1. 데이터 구조 파악: 현재 saved_recipes 테이블의 recipe_data 컬럼은 Gemini가 준 JSON(jsonb 타입)이 통째로 들어가 있고, 그 안에 title이라는 키값으로 요리 이름이 저장되어 있다.
2. Supabase Update 처리: PostgreSQL의 jsonb_set 기능을 사용하면 테이블 전체를 바꿀 필요 없이, JSON 내부의 특정 키(title)만 쏙 골라서 안전하게 업데이트할 수 있다.

프롬프트:

> 파일 위치: app/api/recipe/update-title/route.ts

```
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // 서버 컴포넌트/API용 클라이언트

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // 유저가 로그인 상태인지 검증 (보안)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { recipeId, newTitle } = await request.json();

    if (!recipeId || !newTitle.trim()) {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다.' }, { status: 400 });
    }

    // 💡 jsonb_set을 이용해 recipe_data 안의 'title' 키값만 안전하게 변경
    const { error } = await supabase
      .from('saved_recipes')
      .update({
        recipe_data: supabase.raw(`jsonb_set(recipe_data, '{title}', '"${newTitle.trim()}"'::jsonb)`)
      })
      .eq('id', recipeId)
      .eq('user_id', user.id); // 본인 레시피만 수정 가능하도록 방어 코드

    // 만약 위의 원시 쿼리(raw) 방식이 복잡하다면, 
    // 아래 주석처럼 기존 데이터를 긁어와서 자바스크립트로 수정한 뒤 다시 덮어씌워도 괜찮아.
    /*
    const { data: current } = await supabase.from('saved_recipes').select('recipe_data').eq('id', recipeId).single();
    if (current) {
      const updatedData = { ...current.recipe_data, title: newTitle.trim() };
      await supabase.from('saved_recipes').update({ recipe_data: updatedData }).eq('id', recipeId);
    }
    */

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('이름 수정 에러:', error);
    return NextResponse.json({ error: '요리 이름을 변경하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
```
---
### 레시피 저장 기능 구현 (4)

프롬프트:

> 사용자가 저장한 레시피들을 격자(Grid) 형태로 보여주고, 타이틀 옆의 ✏️ 버튼을 누르면 인풋창으로 바뀌면서 이름을 즉시 수정할 수 있는 SavedRecipesModal.tsx 컴포넌트야.
>
>파일 위치: app/components/SavedRecipesModal.tsx

```
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedRecipe {
  id: string;
  recipe_data: {
    title: string;
    difficulty: string;
    cookingTime: string;
    steps: string[];
    chefTip: string;
  };
  created_at: string;
}

export default function SavedRecipesModal({ isOpen, onClose }: SavedRecipesModalProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 이름 수정을 위한 상태 관리
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // 저장된 레시피 리스트 불러오기
  const fetchSavedRecipes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data as SavedRecipe[]);
    } catch (error) {
      console.error(error);
      alert('보관함 레시피를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSavedRecipes();
  }, [isOpen]);

  // 💡 요리 이름 업데이트 함수 호출
  const handleUpdateTitle = async (recipeId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch('/api/recipe/update-title', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, newTitle: editTitle }),
      });

      if (!response.ok) throw new Error('수정 실패');

      // 프론트엔드 상태 실시간 업데이트 (새로고침 없이 반영)
      setRecipes((prev) =>
        prev.map((item) =>
          item.id === recipeId
            ? { ...item, recipe_data: { ...item.recipe_data, title: editTitle } }
            : item
        )
      );
      setEditingId(null);
    } catch (error) {
      alert('이름 수정 중 에러가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-50 rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* 헤더 */}
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">❤️ 나만의 레시피 보관함</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* 본문 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500">로딩 중...</div>
          ) : recipes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <span className="text-4xl">🍳</span>
              <p>아직 저장된 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    {/* 💡 요리 이름 노출 및 수정 인터페이스 */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold"
                          />
                          <button
                            onClick={() => handleUpdateTitle(item.id)}
                            className="bg-sky-500 text-white px-2 py-1 rounded-lg text-xs font-bold"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <h3 className="font-extrabold text-slate-800 text-base">{item.recipe_data.title}</h3>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTitle(item.recipe_data.title);
                            }}
                            className="text-slate-400 hover:text-sky-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md whitespace-nowrap">
                        {item.recipe_data.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">⏱️ 소요 시간: {item.recipe_data.cookingTime}</p>
                    <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border">
                      💡 {item.recipe_data.chefTip}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => alert('상세 보기 모달을 띄우거나 기능을 확장할 수 있습니다.')}
                      className="text-xs font-bold text-sky-600 hover:underline"
                    >
                      레시피 보기 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

> 구현된 SavedRecipesModal을 메인 페이지나 프로필 팝오버 컴포넌트에 임포트하고, isSavedModalOpen 상태값(true/false)을 줘서 열리게 설정해줘

---
### 레시피 저장 기능 구현 (5): 메모 기능

Supabase SQL Editor에서 아래 명령어를 실행:

```
-- saved_recipes 테이블에 user_memo 컬럼 추가 (기본값은 빈 텍스트)
alter table saved_recipes add column user_memo text default '';
```

프롬프트:

> 보관함에서 유저가 메모를 작성하고 [메모 저장]을 누르면, 해당 레시피의 user_memo 컬럼만 쏙 바꿔주는 PATCH API야.
> - 파일 위치: app/api/recipe/update-memo/route.ts

```
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // 💡 로그인 유저 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const { recipeId, memo } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: '잘못된 요청 데이터입니다.' }, { status: 400 });
    }

    // 💡 해당 레시피의 user_memo 컬럼만 업데이트 (유저 보안 매칭 포함)
    const { error } = await supabase
      .from('saved_recipes')
      .update({ user_memo: memo })
      .eq('id', recipeId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('메모 저장 에러:', error);
    return NextResponse.json({ error: '메모를 저장하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

---
### 레시피 저장 기능 구현 (6): 메모 기능

프롬프트:

> 이전에 만들었던 보관함 모달(app/components/SavedRecipesModal.tsx) 코드 안에 메모를 보여주고 즉시 수정/저장할 수 있는 인풋 폼(Form)을 심어줄게.
>
> 기존의 SavedRecipesModal.tsx 전체 코드를 아래 내용으로 업데이트해 주면 돼.

```
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedRecipe {
  id: string;
  recipe_data: {
    title: string;
    difficulty: string;
    cookingTime: string;
    steps: string[];
    chefTip: string;
  };
  user_memo: string; // 💡 추가된 메모 필드 정의
  created_at: string;
}

export default function SavedRecipesModal({ isOpen, onClose }: SavedRecipesModalProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 이름 수정 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // 💡 메모 수정 관련 상태 관리
  const [memoStates, setMemoStates] = useState<Record<string, string>>({});

  // 저장된 레시피 불러오기
  const fetchSavedRecipes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const fetchedRecipes = data as SavedRecipe[];
      setRecipes(fetchedRecipes);

      // 💡 불러온 메모 데이터를 상태값에 초기 매핑
      const initialMemos: Record<string, string> = {};
      fetchedRecipes.forEach((item) => {
        initialMemos[item.id] = item.user_memo || '';
      });
      setMemoStates(initialMemos);

    } catch (error) {
      console.error(error);
      alert('보관함 레시피를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSavedRecipes();
  }, [isOpen]);

  // 요리 이름 업데이트
  const handleUpdateTitle = async (recipeId: string) => {
    if (!editTitle.trim()) return;
    try {
      const response = await fetch('/api/recipe/update-title', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, newTitle: editTitle }),
      });
      if (!response.ok) throw new Error();

      setRecipes((prev) =>
        prev.map((item) =>
          item.id === recipeId
            ? { ...item, recipe_data: { ...item.recipe_data, title: editTitle } }
            : item
        )
      );
      setEditingId(null);
    } catch (error) {
      alert('이름 수정 중 에러가 발생했습니다.');
    }
  };

  // 💡 메모 데이터베이스 실시간 업데이트 함수
  const handleSaveMemo = async (recipeId: string) => {
    const currentMemo = memoStates[recipeId] || '';
    try {
      const response = await fetch('/api/recipe/update-memo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, memo: currentMemo }),
      });

      if (!response.ok) throw new Error();
      alert('📝 요리 메모가 안전하게 저장되었습니다!');
    } catch (error) {
      alert('메모를 저장하는 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-50 rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* 헤더 */}
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">❤️ 나만의 레시피 보관함</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {/* 본문 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500">로딩 중...</div>
          ) : recipes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <span className="text-4xl">🍳</span>
              <p>아직 저장된 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    {/* 타이틀 및 이름 수정 영역 */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold"
                          />
                          <button onClick={() => handleUpdateTitle(item.id)} className="bg-sky-500 text-white px-2 py-1 rounded-lg text-xs font-bold">저장</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs">취소</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <h3 className="font-extrabold text-slate-800 text-base">{item.recipe_data.title}</h3>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTitle(item.recipe_data.title);
                            }}
                            className="text-slate-400 hover:text-sky-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md whitespace-nowrap">
                        {item.recipe_data.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">⏱️ 소요 시간: {item.recipe_data.cookingTime}</p>
                    <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border mb-4">
                      💡 {item.recipe_data.chefTip}
                    </p>

                    {/* 💡 나만의 요리 메모 입력 공간 추가 */}
                    <div className="mt-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          📝 나만의 요리 메모
                        </label>
                        <button
                          onClick={() => handleSaveMemo(item.id)}
                          className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded-md font-bold transition shadow-sm"
                        >
                          메모 저장
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="이 요리를 직접 해본 후 나만의 커스텀 레시피 기록을 남겨보세요! (예: 간장 1스푼 추가 등)"
                        value={memoStates[item.id] || ''}
                        onChange={(e) =>
                          setMemoStates((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-full p-2 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => alert('상세 보기 기능을 구현하여 전체 레시피 조리 순서를 보여줄 수 있습니다.')}
                      className="text-xs font-bold text-sky-600 hover:underline"
                    >
                      전체 레시피 보기 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---
### 요리 스타일 필터 추가

프롬프트:

> 바구니 컴포넌트 수정 (app/components/Basket.tsx): '요리하기' 버튼 위에 원하는 스타일을 선택할 수 있는 칩(Chip) 버튼들을 추가해 줘.

```
// ... 기존 인터페이스에 추가
interface BasketProps {
  selectedIngredients: any[];
  onRemoveIngredient: (ingredient: any) => void;
  onCook: (style: string) => void; // 💡 요리 스타일을 매개변수로 받도록 수정
}

const COOKING_STYLES = ['일반 레시피', '매콤/얼큰하게', '아이용(안 맵게)', '다이어트/저염식', '간단한 술안주'];

export default function Basket({ selectedIngredients, onRemoveIngredient, onCook }: BasketProps) {
  const [selectedStyle, setSelectedStyle] = React.useState('일반 레시피');

  return (
    <div className="w-full max-w-xs bg-amber-50 rounded-3xl p-6 border-4 border-amber-200 shadow-lg flex flex-col h-[650px]">
      {/* ... 기존 바구니 재료 리스트 영역 생략 ... */}

      {/* 💡 요리 스타일 필터 UI 추가 */}
      <div className="mb-4">
        <label className="text-xs font-bold text-amber-900 block mb-2">✨ 요리 스타일 선택</label>
        <div className="flex flex-wrap gap-1.5">
          {COOKING_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                selectedStyle === style
                  ? 'bg-amber-600 border-amber-700 text-white shadow-sm font-bold'
                  : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-100'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onCook(selectedStyle)} // 💡 선택된 스타일을 부모 컴포넌트로 전달
        disabled={selectedIngredients.length === 0}
        className="..."
      >
```

---
### 깃허브에 커밋하기

프롬프트:

> 현재 연결된 깃허브 계정 정보를 알려줘.

1. 깃허브 저장소 만들기
2. 깃허브에 코드베이스 업로드하기

```
git remote add origin https://github.com/choisangyun0314-max/AI_Chef.git
깃허브에 업로드해줘.
```
---
### Vercel에서 배포하기

배포시 .env.local 파일에 있는 환경 변수를 반드시 등록해야 함
---
### Google Cloud Console에 승인된 JavaScript 원본 추가

배포가 이루어진 후에는 구글 로그인을 위해 배포 URL을 등록해주어야 함

```
Google Cloud Console의 [Google 인증 플랫폼]-[클라이언트]에서
해당 프로젝트를 선택하고 [웹 애플리케이션의 클라이언트 ID]에 있는
[승인된 JavaScript 원본]에 배포 URL 추가
```
---
### Supabase의 Redirect URLs 수정

배포가 이루어진 후에는 구글 로그인을 위해 Supabase의 Redirect URLs 수정해 주어야 함

```
Vercel 주소에서 로그인이 정상적으로 작동하려면, Supabase 설정에서 아래 확인이 필요할 수 있음:

- Supabase 대시보드 접속
- Authentication -> URL Configuration 메뉴로 이동
- Redirect URLs 항목에 [배포주소]/auth/callback 주소가 추가
	예) https://inu-courses.vercel.app/auth/callback

※ [배포주소]/auth에서 auth는 개발 상황에 따라 이름이 다를 수 있음