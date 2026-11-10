import Image from "next/image";
import { Package, type LucideIcon } from "lucide-react";

/** Ürün görseli: fotoğraf varsa onu, yoksa sakin bir zemin üzerinde ürün ikonunu gösterir */
export default function ProductImage({
  src,
  icon: Icon = Package,
  alt = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
  className = "",
}: {
  src?: string;
  icon?: LucideIcon;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative block overflow-hidden bg-cream-200 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <Icon strokeWidth={1.25} className="absolute left-1/2 top-1/2 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 text-olive-700/30" />
      )}
    </span>
  );
}
