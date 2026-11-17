import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buharkent Pazarı",
    short_name: "Buharkent Pazarı",
    description: "Buharkent'in üreticilerinden doğrudan sofrana. Aracı yok, komisyon yok.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#2f3718",
    lang: "tr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
