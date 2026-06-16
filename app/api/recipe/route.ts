import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

function generateMockRecipe(ingredients: string[], style: string) {
  const title = ingredients.length > 1 
    ? `${ingredients[0]}와 ${ingredients[1]}를 활용한 ${style} 셰프 특별 요리`
    : `${ingredients[0]} ${style} 홈쿡 요리`;
  
  return {
    title: title,
    difficulty: '초급' as const,
    cookingTime: '15분',
    ingredientsUsed: ingredients,
    basicPantry: ['소금', '설탕', '식용유', '참기름', '물'],
    steps: [
      `${ingredients.join(', ')} 재료를 깨끗이 씻고 다듬어 준비합니다.`,
      `요리 스타일에 맞추어 프라이팬에 식용유를 두르고 준비된 주재료를 함께 볶아 줍니다.`,
      `소금과 설탕 등으로 간을 맞춘 후 기호에 맞게 파나 고추를 곁들입니다.`,
      "요리가 완성되면 참기름을 두르고 예쁜 그릇에 정성스레 담아냅니다."
    ],
    chefTip: "재료의 고유한 향을 극대화하기 위해 양념은 조리 마지막 단계에서 넣는 것을 권장합니다!"
  }
}

export async function POST(request: Request) {
  let requestIngredients: string[] = []
  let requestStyle = '일반 레시피'
  try {
    const { ingredients, style } = await request.json()
    requestIngredients = ingredients
    if (style) requestStyle = style

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: '선택된 식재료가 없습니다.' },
        { status: 400 }
      )
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
    })

    // 💡 2. Vercel AI SDK를 이용해 Gemini 호출
    const { object: recipeData } = await generateObject({
      model: google('gemini-3.1-flash-lite'),
      schema: recipeSchema,
      system: "당신은 사용자의 냉장고 속에 남은 식재료를 활용해 최고의 요리를 제안하는 전문 AI 셰프입니다. 주어진 재료를 최대한 활용하되, 사용자가 요청한 요리 스타일에 완벽히 부합하며, 현실적이고 집에서 따라 하기 쉬운 매력적인 레시피 '딱 한 가지'만 생성해야 합니다. 기본적인 조미료나 물 등은 사용자의 주방에 구비되어 있다고 가정해도 좋습니다.",
      prompt: `사용자가 가진 식재료 목록: [${ingredients.join(', ')}]\n요청한 요리 스타일: [${requestStyle}]\n\n위 식재료들을 조합하여 사용자가 요청한 요리 스타일에 정확히 부합하는 가장 맛있는 요리 레시피를 정의된 스키마 구조에 맞춰 생성해 주세요.`,
    })

    return NextResponse.json({
      ...recipeData,
      isMock: false
    })
  } catch (error: any) {
    console.error('Gemini SDK 에러 발생:', error)
    
    // API Key 크레딧 소진 등의 경우를 위한 로컬 모각 레시피 생성
    const mockRecipe = generateMockRecipe(
      requestIngredients.length > 0 ? requestIngredients : ['달걀', '양파'],
      requestStyle
    )
    
    return NextResponse.json({
      ...mockRecipe,
      isMock: true,
      apiError: error.message || 'Gemini API 호출 오류가 발생했습니다.'
    })
  }
}
