import { Schema, model, models, type Model, type Types } from "mongoose";
import type { PartStatus, PaymentMethod } from "@/lib/orders";

export interface IOrderItem {
  listing: Types.ObjectId;
  variantId: Types.ObjectId;
  product: Types.ObjectId;
  slug: string;
  name: string;
  label: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IHistory {
  status: PartStatus;
  at: Date;
  by?: "customer" | "seller" | "admin" | "system";
  note?: string;
}

export interface IOrderPart {
  _id: Types.ObjectId;
  seller: Types.ObjectId; // User
  sellerName: string;
  sellerPhone?: string;
  iban?: string; // sipariş anındaki IBAN (havale için)
  ibanName?: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: PartStatus;
  cargoCompany?: string;
  trackingNo?: string;
  cancelReason?: string;
  history: IHistory[];
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNo: string;
  token: string; // misafir takibi için gizli anahtar
  user?: Types.ObjectId;
  customer: { name: string; email: string; phone: string };
  address: { city: string; district: string; address: string };
  note?: string;
  payment: PaymentMethod;
  parts: IOrderPart[];
  subtotal: number;
  shipping: number;
  total: number;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IOrderItem>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true, maxlength: 120 },
    name: { type: String, required: true, maxlength: 120 },
    label: { type: String, required: true, maxlength: 30 },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1, max: 99 },
    image: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const HistorySchema = new Schema<IHistory>(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true },
    by: { type: String, enum: ["customer", "seller", "admin", "system"] },
    note: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const STATUSES = ["pending_payment", "preparing", "shipped", "delivered", "cancelled"];

const PartSchema = new Schema<IOrderPart>({
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sellerName: { type: String, required: true, maxlength: 80 },
  sellerPhone: { type: String, maxlength: 20 },
  iban: { type: String, maxlength: 34 },
  ibanName: { type: String, maxlength: 80 },
  items: { type: [ItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: STATUSES, required: true },
  cargoCompany: { type: String, maxlength: 40 },
  trackingNo: { type: String, maxlength: 40 },
  cancelReason: { type: String, maxlength: 300 },
  history: { type: [HistorySchema], default: [] },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNo: { type: String, required: true, unique: true, maxlength: 12 },
    token: { type: String, required: true, maxlength: 64 },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customer: {
      name: { type: String, required: true, maxlength: 80 },
      email: { type: String, required: true, lowercase: true, maxlength: 120, index: true },
      phone: { type: String, required: true, maxlength: 20 },
    },
    address: {
      city: { type: String, required: true, maxlength: 40 },
      district: { type: String, required: true, maxlength: 40 },
      address: { type: String, required: true, maxlength: 300 },
    },
    note: { type: String, maxlength: 300 },
    payment: { type: String, enum: ["havale", "kapida"], required: true },
    parts: { type: [PartSchema], validate: [(v: unknown[]) => v.length > 0, "Sipariş boş olamaz"] },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: true }
);

OrderSchema.index({ "parts.seller": 1, createdAt: -1 });
OrderSchema.index({ "parts.status": 1 });

export const Order: Model<IOrder> = (models.Order as Model<IOrder>) ?? model<IOrder>("Order", OrderSchema);
