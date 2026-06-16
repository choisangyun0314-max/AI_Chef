'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()

  // 이미 로그인한 사용자라면 메인 페이지로 리다이렉트 (팝업 모드가 아닐 때만)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && window.name !== 'supabase-oauth-popup') {
        router.push('/')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && window.name !== 'supabase-oauth-popup') {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 로그인 완료 후 부모 창에 알리기 위해 홈페이지로 리다이렉트 (팝업창 내에서 열림)
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error('OAuth 로그인 에러:', err.message)
      alert('로그인 오류가 발생했습니다: ' + err.message)
    }
  }

  const handleClose = () => {
    window.close()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-sky-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-sky-400/5 via-blue-500/0 to-transparent blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-8 shadow-[0_20px_45px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-6 z-10 relative">
        {/* Mascot Image */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-2">
          <Image
            src="/Mascot.jpg"
            alt="AI Chef Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-black text-zinc-800 tracking-tight">AI Chef 로그인</h2>
          <p className="text-[11px] text-zinc-500 font-semibold tracking-wide">
            냉장고 식재료 매칭 & AI 레시피 서비스
          </p>
        </div>

        {/* Divider line */}
        <div className="w-full h-[1px] bg-zinc-150" />

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 py-3.5 rounded-2xl text-xs font-bold transition duration-300 shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {/* Google G Logo SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Google 계정으로 계속하기</span>
        </button>

        {/* Small Close Window Option */}
        <button
          onClick={handleClose}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors font-bold mt-2 cursor-pointer"
        >
          창 닫기
        </button>
      </div>
    </main>
  )
}
