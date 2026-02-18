import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface SubscribeBody {
  email: string;
  category: string;
  difficulty: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscribeBody;
    const { email, category, difficulty } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "올바른 이메일 주소를 입력해주세요." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    // Supabase 미설정 → 테스트 모드
    if (!supabase) {
      console.log("[subscribe] Supabase 미설정 — 테스트 모드:", {
        email,
        category,
        difficulty,
      });
      return NextResponse.json({ success: true, message: "등록 완료" });
    }

    // 이메일 중복 체크
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "이미 등록된 이메일입니다." },
        { status: 409 },
      );
    }

    // Supabase에 저장
    const { error } = await supabase.from("subscribers").insert({
      email,
      category: category || null,
      difficulty: difficulty || null,
    });

    if (error) {
      console.error("[subscribe] Supabase insert error:", error);
      return NextResponse.json(
        { success: false, message: "등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "등록 완료" });
  } catch {
    return NextResponse.json(
      { success: false, message: "요청을 처리할 수 없습니다." },
      { status: 500 },
    );
  }
}
