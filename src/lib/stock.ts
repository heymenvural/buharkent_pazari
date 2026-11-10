import { trusted, type Types } from "mongoose";
import { Listing } from "@/models/Listing";

type Id = Types.ObjectId | string;

/** Stoktan düşer; yeterli stok yoksa hiçbir şey yapmadan false döner (aynı anda gelen siparişlerde de güvenli) */
export async function takeStock(listingId: Id, variantId: Id, qty: number) {
  const r = await Listing.updateOne(
    { _id: listingId, variants: trusted({ $elemMatch: { _id: variantId, stock: { $gte: qty } } }) },
    { $inc: { "variants.$.stock": -qty } }
  );
  return r.modifiedCount === 1;
}

/** İptal veya hata durumunda stoğu geri verir */
export async function returnStock(listingId: Id, variantId: Id, qty: number) {
  await Listing.updateOne({ _id: listingId, "variants._id": variantId }, { $inc: { "variants.$.stock": qty } });
}
