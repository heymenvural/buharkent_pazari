import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  listing: Types.ObjectId;
  user?: Types.ObjectId;
  order?: Types.ObjectId; // sadece satın alanlar yorum yapabilir
  name: string;
  rating: number;
  text: string;
  status: "published" | "hidden";
  demo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// Bir siparişteki her ürün için tek yorum
ReviewSchema.index({ order: 1, listing: 1 }, { unique: true, partialFilterExpression: { order: { $exists: true } } });

export const Review: Model<IReview> = (models.Review as Model<IReview>) ?? model<IReview>("Review", ReviewSchema);