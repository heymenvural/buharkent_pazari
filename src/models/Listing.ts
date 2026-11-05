import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IVariant {
  _id: Types.ObjectId;
  label: string;
  size: number;
  price: number;
  oldPrice?: number;
  stock: number;
}

export interface IListing {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  seller: Types.ObjectId; // User
  variants: IVariant[];
  shippingFee: number;
  shipsIn: string;
  note: string;
  details: { k: string; v: string }[];
  images: string[];
  rating: number;
  reviewCount: number;
  status: "active" | "paused" | "pending";
  demo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  label: { type: String, required: true, trim: true, maxlength: 30 },
  size: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0, max: 1_000_000 },
  oldPrice: { type: Number, min: 0, max: 1_000_000 },
  stock: { type: Number, required: true, min: 0, max: 100_000 },
});

const ListingSchema = new Schema<IListing>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    variants: { type: [VariantSchema], validate: [(v: unknown[]) => v.length > 0 && v.length <= 10, "1-10 seçenek olmalı"] },
    shippingFee: { type: Number, required: true, min: 0, max: 10_000 },
    shipsIn: { type: String, default: "1-2 gün", maxlength: 30 },
    note: { type: String, default: "", maxlength: 2000 },
    details: { type: [{ k: { type: String, maxlength: 40 }, v: { type: String, maxlength: 200 } }], default: [] },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "paused", "pending"], default: "pending", index: true },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ListingSchema.index({ product: 1, status: 1 });
ListingSchema.index({ product: 1, seller: 1 }, { unique: true });

export const Listing: Model<IListing> = (models.Listing as Model<IListing>) ?? model<IListing>("Listing", ListingSchema);