"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthTabs } from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import SellerRegisterForm from "@/components/auth/SellerRegisterForm";

export default function RegisterSwitch({ next, initialTab }: { next: string; initialTab: "musteri" | "uretici" }) {
  const [tab, setTab] = useState(initialTab);
  return (
    <div>
      <AuthTabs value={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {tab === "musteri" ? (
            <RegisterForm next={next} />
          ) : (
            <>
              <p className="mb-6 rounded-2xl bg-cream-200 px-4 py-3 text-sm text-olive-900">
                Buharkent&apos;te üretiyorsan başvur. Dernek ekibimiz başvurunu inceleyip onayladıktan sonra hesabın aktif olur.
              </p>
              <SellerRegisterForm />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}