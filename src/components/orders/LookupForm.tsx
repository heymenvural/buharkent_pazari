"use client";

import { useActionState } from "react";
import { Loader2, Search } from "lucide-react";
import { lookupOrder } from "@/app/actions/order";

export default function LookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">Sipariş numarası</span>
        <input name="orderNo" required placeholder="BP-XXXXXX" maxLength={9} autoCapitalize="characters" className="w-full rounded-2xl border-2 border-sand-300 bg-cream-50 px-4 py-3.5 font-mono uppercase outline-none focus:border-olive-500" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">Sipariş verirken yazdığın e-posta</span>
        <input name="email" type="email" required maxLength={120} autoComplete="email" className="w-full rounded-2xl border-2 border-sand-300 bg-cream-50 px-4 py-3.5 outline-none focus:border-olive-500" />
      </label>
      {state.error && <p className="rounded-2xl bg-terra-500/10 px-4 py-3 text-sm font-medium text-terra-600">{state.error}</p>}
      <button disabled={pending} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-olive-700 font-semibold text-cream-50 hover:bg-olive-900 disabled:opacity-60">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />} Siparişimi bul
      </button>
    </form>
  );
}
