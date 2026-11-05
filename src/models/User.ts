import { Schema, model, models, type Model, type Types } from "mongoose";

export type Role = "buyer" | "seller" | "admin";
export type SellerStatus = "pending" | "approved" | "rejected";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  phone?: string;
  role: Role;
  sellerStatus?: SellerStatus;
  emailVerified?: Date;
  providers: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, select: false },
    image: { type: String, maxlength: 500 },
    phone: { type: String, maxlength: 20 },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    sellerStatus: { type: String, enum: ["pending", "approved", "rejected"] },
    emailVerified: Date,
    providers: { type: [String], default: [] },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const User: Model<IUser> = (models.User as Model<IUser>) ?? model<IUser>("User", UserSchema);