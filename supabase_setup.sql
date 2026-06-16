-- ==========================================
-- 1. public.users 테이블 생성
-- ==========================================
-- auth.users 테이블과 외래 키(FK)로 연결되어 회원의 프로필을 관리합니다.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 2. 행 수준 보안 (RLS) 활성화 및 정책 설정
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 누구나 다른 사용자의 공개 프로필을 조회할 수 있도록 SELECT 정책 추가
CREATE POLICY "Allow public read access" 
ON public.users 
FOR SELECT 
USING (true);

-- 자기 자신의 프로필 정보만 수정(UPDATE)할 수 있도록 설정
CREATE POLICY "Allow individual users to update their own profiles" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- ==========================================
-- 3. 구글 로그인 시 회원정보 자동 저장 트리거 함수 정의
-- ==========================================
-- auth.users 테이블에 새 회원이 생기면, 그 회원 메타데이터를 파싱하여 public.users에 복사합니다.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$;

-- ==========================================
-- 4. auth.users 테이블에 트리거 생성
-- ==========================================
-- auth.users 에 INSERT가 일어난 후 트리거 함수를 실행합니다.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. public.saved_recipes (레시피 보관함) 테이블 생성
-- ==========================================
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipe_data JSONB NOT NULL,
  user_memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- 본인의 저장된 레시피만 조회(SELECT)할 수 있도록 설정
CREATE POLICY "Allow individual users to read their own saved recipes"
ON public.saved_recipes
FOR SELECT
USING (auth.uid() = user_id);

-- 본인의 저장된 레시피만 추가(INSERT)할 수 있도록 설정
CREATE POLICY "Allow individual users to insert their own saved recipes"
ON public.saved_recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 본인의 저장된 레시피만 삭제(DELETE)할 수 있도록 설정
CREATE POLICY "Allow individual users to delete their own saved recipes"
ON public.saved_recipes
FOR DELETE
USING (auth.uid() = user_id);

-- 본인의 저장된 레시피만 수정(UPDATE)할 수 있도록 설정
CREATE POLICY "Allow individual users to update their own saved recipes"
ON public.saved_recipes
FOR UPDATE
USING (auth.uid() = user_id);
