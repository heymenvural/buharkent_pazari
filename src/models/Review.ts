import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  listing: Types.ObjectId;
  user?: Types.ObjectId;
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
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Review: Model<IReview> = (models.Review as Model<IReview>) ?? model<IReview>("Review", ReviewSchema);