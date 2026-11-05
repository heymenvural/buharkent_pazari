import { Schema, model, models, type Model, type Types } from "mongoose";

export type ReportReason = "sahte" | "baskasinin-urunu" | "saglik" | "yaniltici" | "yasak" | "diger";
export type ReportStatus = "open" | "removed" | "dismissed";

export interface IReport {
  _id: Types.ObjectId;
  listing: Types.ObjectId;
  seller: Types.ObjectId;
  reason: ReportReason;
  note: string;
  email?: string;
  reporter?: Types.ObjectId;
  status: ReportStatus;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, enum: ["sahte", "baskasinin-urunu", "saglik", "yaniltici", "yasak", "diger"], required: true },
    note: { type: String, default: "", maxlength: 1000 },
    email: { type: String, maxlength: 120 },
    reporter: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "removed", "dismissed"], default: "open", index: true },
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Report: Model<IReport> = (models.Report as Model<IReport>) ?? model<IReport>("Report", ReportSchema);
