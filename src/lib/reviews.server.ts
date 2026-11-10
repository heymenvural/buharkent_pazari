import { Types } from "mongoose";
import { Listing } from "@/models/Listing";
import { Review } from "@/models/Review";

/** İlanın ortalama puanını ve yorum sayısını yayındaki yorumlardan yeniden hesaplar */
export async function recomputeRating(listingId: Types.ObjectId | string) {
  const id = new Types.ObjectId(String(listingId));
  const [r] = await Review.aggregate<{ avg: number; n: number }>([
    { $match: { listing: id, status: "published" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  await Listing.updateOne({ _id: id }, { rating: r ? Math.round(r.avg * 10) / 10 : 0, reviewCount: r?.n ?? 0 });
}
