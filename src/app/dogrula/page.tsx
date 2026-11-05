import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import VerifyForm from "@/components/auth/VerifyForm";

export const metadata: Metadata = { title: "E-posta doğrulama", robots: { index: false } };

type Props = { searchParams: Promise<{ email?: string | string[]; notice?: string }> };

export default async function VerifyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.email) ? sp.email[0] : sp.email;
  const email = (raw ?? "").slice(0, 120);
  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AuthShell title="E-postanı doğrula" subtitle="Kayıt olurken girdiğin adrese bir kod gönderdik.">
        <VerifyForm initialEmail={email} notice={sp.notice === "1"} />
      </AuthShell>
    </main>
  );
}