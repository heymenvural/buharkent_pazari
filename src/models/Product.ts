import { Schema, model, models, type Model, type Types } from "mongoose";

export type Tag = "firsat" | "cok-satan" | "yeni";

export interface IProduct {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  category: string;
  description: string;
  iconKey: string;
  bg: string;
  light: boolean;
  images: string[];
  tags: Tag[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, index: true, maxlength: 60 },
    description: { type: String, default: "", maxlength: 2000 },
    iconKey: { type: String, default: "Package", maxlength: 40 },
    bg: { type: String, default: "from-sand-300 to-sand-400", maxlength: 120 },
    light: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    tags: { type: [String], enum: ["firsat", "cok-satan", "yeni"], default: [] },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = (models.Product as Model<IProduct>) ?? model<IProduct>("Product", ProductSchema);