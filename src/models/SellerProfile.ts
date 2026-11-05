import { Schema, model, models, type Model, type Types } from "mongoose";

export type SellerKind = "kadin-girisimci" | "genc-ciftci" | "diger";

export interface ISellerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  phone: string;
  village: string;
  sellerType: SellerKind;
  categories: string[];
  description: string;
  // Mağaza bilgileri (onaydan sonra üretici panelinden düzenlenecek)
  slug?: string;
  shopName?: string;
  tagline?: string;
  story: string[];
  since?: number;
  verified: boolean;
  demo: boolean;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SellerProfileSchema = new Schema<ISellerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, required: true, maxlength: 20 },
    village: { type: String, required: true, trim: true, maxlength: 60 },
    sellerType: { type: String, enum: ["kadin-girisimci", "genc-ciftci", "diger"], required: true },
    categories: { type: [String], default: [] },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 80 },
    shopName: { type: String, trim: true, maxlength: 80 },
    tagline: { type: String, trim: true, maxlength: 160 },
    story: { type: [String], default: [] },
    since: { type: Number, min: 1950, max: 2100 },
    verified: { type: Boolean, default: false },
    demo: { type: Boolean, default: false },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectReason: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export const SellerProfile: Model<ISellerProfile> =
  (models.SellerProfile as Model<ISellerProfile>) ?? model<ISellerProfile>("SellerProfile", SellerProfileSchema);