"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // Tarayıcının kendi kaydırması: daha az yorucu. Lenis sadece pencere açıkken sayfayı kilitlemek için kalıyor.
        smoothWheel: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}