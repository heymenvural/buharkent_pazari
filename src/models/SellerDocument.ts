import { Schema, model, models, type Model, type Types } from "mongoose";
import type { DocKey } from "@/lib/compliance";

export interface ISellerDocument {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  docKey: DocKey;
  fileId: Types.ObjectId;
  mime: string;
  size: number;
  originalName: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SellerDocumentSchema = new Schema<ISellerDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    docKey: { type: String, required: true, enum: ["cks", "aks", "hayvan", "sikim", "gikb", "hijyen", "muafiyet", "levha"] },
    fileId: { type: Schema.Types.ObjectId, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String, maxlength: 120 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    note: { type: String, maxlength: 300 },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Her belge türünden kullanıcı başına bir güncel dosya
SellerDocumentSchema.index({ user: 1, docKey: 1 }, { unique: true });

export const SellerDocument: Model<ISellerDocument> =
  (models.SellerDocument as Model<ISellerDocument>) ?? model<ISellerDocument>("SellerDocument", SellerDocumentSchema);