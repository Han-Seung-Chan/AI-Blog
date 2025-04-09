import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 유효성 검사
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL과 Anon Key가 환경 변수에 설정되어 있지 않습니다.",
    "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local 파일에 추가하세요.",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
