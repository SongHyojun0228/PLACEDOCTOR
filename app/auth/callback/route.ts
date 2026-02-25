import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // public.users 테이블에 유저 레코드 생성 (최초 로그인 시)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email || "",
            plan: "free",
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 에러 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login`);
}
