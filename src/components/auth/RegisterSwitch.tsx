"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthTabs } from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import SellerWizard from "@/components/seller/SellerWizard";

export default function RegisterSwitch({ next, initialTab }: { next: string; initialTab: "musteri" | "uretici" }) {
  const [tab, setTab] = useState(initialTab);
  return (
    <div>
      <AuthTabs value={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {tab === "musteri" ? <RegisterForm next={next} /> : <SellerWizard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}