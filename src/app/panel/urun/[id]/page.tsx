import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId, trusted } from "mongoose";
import { getApprovedSeller } from "@/lib/data/seller.server";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { PRODUCT_TYPES } from "@/lib/compliance";
import { parseLabel } from "@/lib/units";
import ListingForm, { type ListingInitial, type PickProduct } from "@/components/seller/ListingForm";

export const metadata: Metadata = { title: "Ürün", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const { user, profile } = await getApprovedSeller();
  const allowed = profile.productTypes ?? [];
  const types = PRODUCT_TYPES.filter((t) => allowed.includes(t.key)).map((t) => ({ key: t.key, name: t.name }));

  if (id === "yeni") {
    const [rows, mine] = await Promise.all([
      Product.find({ productType: trusted({ $in: allowed }), $or: [{ active: true }, { createdBy: user._id }] }).select("name productType active").sort({ name: 1 }).lean(),
      Listing.find({ seller: user._id }).distinct("product"),
    ]);
    const taken = new Set(mine.map(String));
    const products: PickProduct[] = rows
      .filter((p) => !taken.has(p._id.toString()))
      .map((p) => ({
        id: p._id.toString(),
        name: p.name,
        productType: p.productType!,
        typeName: PRODUCT_TYPES.find((t) => t.key === p.productType)?.name ?? "",
        pending: !p.active,
      }));
    return (
      <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
        <ListingForm products={products} types={types} />
      </main>
    );
  }

  if (!isValidObjectId(id)) notFound();
  const listing = await Listing.findOne({ _id: id, seller: user._id }).lean();
  if (!listing || listing.locked) notFound();
  const product = await Product.findById(listing.product).select("name").lean();

  const initial: ListingInitial = {
    id: listing._id.toString(),
    productName: product?.name ?? "Ürün",
    status: listing.status,
    adminNote: listing.adminNote,
    note: listing.note,
    images: listing.images ?? [],
    variants: [...listing.variants]
      .sort((a, b) => a.size - b.size)
      .map((v) => {
        const p = parseLabel(v.label);
        return {
          id: v._id.toString(),
          amount: p ? String(p.amount).replace(".", ",") : String(v.size),
          unit: p?.unit ?? "adet",
          price: String(v.price).replace(".", ","),
          oldPrice: v.oldPrice ? String(v.oldPrice).replace(".", ",") : "",
          stock: String(v.stock),
        };
      }),
    shippingFee: String(listing.shippingFee).replace(".", ","),
    shipsIn: listing.shipsIn,
    details: listing.details.map((d) => ({ k: d.k, v: d.v })),
  };

  return (
    <main className="px-4 pb-20 pt-[164px] md:px-8 md:pt-[150px]">
      <ListingForm products={[]} types={types} initial={initial} />
    </main>
  );
}
