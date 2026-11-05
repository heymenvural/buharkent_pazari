"use client";

import { hydrateCatalog, type CatalogData } from "@/lib/catalog";

export default function CatalogProvider({ data, children }: { data: CatalogData; children: React.ReactNode }) {
  hydrateCatalog(data);
  return <>{children}</>;
}