import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    // 현재 플랜 확인 — free 유저는 취소 불필요
    const { data: userData } = await admin
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!userData || userData.plan === "free") {
      return NextResponse.json(
        { success: false, message: "현재 유료 구독 중이 아닙니다." },
        { status: 400 },
      );
    }

    const { error } = await admin
      .from("users")
      .update({
        plan: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[cancel] update error:", error);
      return NextResponse.json(
        { success: false, message: "구독 취소 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "구독이 취소되었습니다. 남은 기간은 계속 이용 가능합니다.",
    });
  } catch (err) {
    console.error("[cancel] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "요청을 처리할 수 없습니다." },
      { status: 500 },
    );
  }
}
