import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/safeNext";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  if (await auth()) redirect(next);
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AuthShell title="Tekrar hoş geldin" subtitle="Hesabına giriş yap.">
        <LoginForm next={next} />
      </AuthShell>
    </main>
  );
}