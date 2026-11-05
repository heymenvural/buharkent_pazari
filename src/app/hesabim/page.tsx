import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountView from "@/components/auth/AccountView";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false } };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris?next=/hesabim");
  // Onaylanmamış üretici sadece başvuru sayfasını görebilir
  if (session.user.role === "seller") redirect(session.user.sellerStatus === "approved" ? "/panel" : "/basvurum");

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <AccountView name={session.user.name ?? "Kullanıcı"} email={session.user.email ?? ""} role={session.user.role} />
    </main>
  );
}