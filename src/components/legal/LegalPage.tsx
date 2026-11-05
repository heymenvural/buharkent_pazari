"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useLenis } from "lenis/react";
import { legalLinks, LEGAL_UPDATED } from "@/lib/legal";

const ease = [0.76, 0, 0.24, 1] as const;

export type Block = string | { list: string[] };
export type Section = { id: string; title: string; blocks: Block[] };

export default function LegalPage({
  current,
  title,
  intro,
  sections,
}: {
  current: string;
  title: string;
  intro: string;
  sections: Section[];
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const lenis = useLenis();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(`#${id}`, { offset: -150, duration: 1.2 });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terra-500">Yasal</span>
        <h1 className="mt-3 text-4xl leading-tight text-olive-900 md:text-6xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Son güncelleme: {LEGAL_UPDATED}</p>
        <p className="mt-5 max-w-3xl leading-relaxed text-ink/80">{intro}</p>
      </motion.div>

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {legalLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              l.href === current ? "bg-olive-700 text-cream-50" : "border border-sand-400 text-olive-900 hover:border-olive-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-36 space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={go(s.id)}
                className={`relative block rounded-xl px-4 py-2 text-sm transition-colors ${
                  active === s.id ? "font-semibold text-olive-900" : "text-muted hover:text-olive-700"
                }`}
              >
                {active === s.id && (
                  <motion.span layoutId="legal-active" className="absolute inset-0 rounded-xl bg-cream-200" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{s.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <article className="rounded-[2rem] bg-cream-50 p-6 shadow-soft md:p-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-40 border-b border-sand-300 py-8 first:pt-0 last:border-0 last:pb-0">
              <h2 className="flex items-start gap-3 text-2xl text-olive-900">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-olive-700/10 font-sans text-xs font-bold text-olive-700">
                  {i + 1}
                </span>
                {s.title}
              </h2>
              {s.blocks.map((b, j) =>
                typeof b === "string" ? (
                  <p key={j} className="mt-3 leading-relaxed text-ink/80">
                    {b}
                  </p>
                ) : (
                  <ul key={j} className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/80 marker:text-olive-500">
                    {b.list.map((li, k) => (
                      <li key={k}>{li}</li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}
        </article>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted">
        <FileText className="h-4 w-4" /> Bu metinle ilgili sorularınız için iletişim bölümündeki adreslerden bize ulaşabilirsiniz.
      </p>
    </div>
  );
}