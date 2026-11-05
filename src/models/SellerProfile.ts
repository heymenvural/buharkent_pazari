import { Schema, model, models, type Model, type Types } from "mongoose";
import type { TaxStatus } from "@/lib/compliance";

export type SellerKind = "kadin-girisimci" | "genc-ciftci" | "diger";

export interface ISellerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  phone: string;
  province?: string;
  district?: string;
  village: string; // mahalle veya köy
  sellerType: SellerKind;
  productTypes: string[];
  taxStatus?: TaxStatus;
  categories: string[];
  description: string; // üreticinin kendini tanıttığı kısa metin
  iban?: string;
  ibanName?: string;
  agreementAt?: Date;
  // Mağaza bilgileri
  slug?: string;
  shopName?: string;
  tagline?: string;
  story: string[];
  since?: number;
  verified: boolean;
  trusted: boolean; // ilk ürünü admin onayından geçti mi
  avatar?: string;
  cover?: string;
  freeShippingOver?: number;
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
    province: { type: String, maxlength: 30 },
    district: { type: String, maxlength: 60 },
    village: { type: String, required: true, trim: true, maxlength: 80 },
    sellerType: { type: String, enum: ["kadin-girisimci", "genc-ciftci", "diger"], required: true },
    productTypes: { type: [String], default: [] },
    taxStatus: { type: String, enum: ["ciftci", "muaf910", "muaf96", "mukellef"] },
    categories: { type: [String], default: [] },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    iban: { type: String, maxlength: 34 },
    ibanName: { type: String, trim: true, maxlength: 80 },
    agreementAt: Date,
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 80 },
    shopName: { type: String, trim: true, maxlength: 80 },
    tagline: { type: String, trim: true, maxlength: 160 },
    story: { type: [String], default: [] },
    since: { type: Number, min: 1950, max: 2100 },
    verified: { type: Boolean, default: false },
    trusted: { type: Boolean, default: false },
    avatar: { type: String, maxlength: 300 },
    cover: { type: String, maxlength: 300 },
    freeShippingOver: { type: Number, min: 0, max: 100_000 },
    demo: { type: Boolean, default: false },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectReason: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export const SellerProfile: Model<ISellerProfile> =
  (models.SellerProfile as Model<ISellerProfile>) ?? model<ISellerProfile>("SellerProfile", SellerProfileSchema);