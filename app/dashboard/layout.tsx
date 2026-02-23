import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.name ?? user?.email ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/dashboard" className="font-logo text-xl text-primary-dark">
            플레이스닥터
          </Link>
          {displayName && (
            <Link
              href="/dashboard/mypage"
              className="text-sm text-gray-500 transition-colors hover:text-primary-brand"
            >
              {displayName}
            </Link>
          )}
        </div>
      </header>

      {/* 콘텐츠 */}
      <main>{children}</main>
    </div>
  );
}
