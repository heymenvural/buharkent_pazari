import { Schema, model, models, type Model, type Types } from "mongoose";

export type Role = "buyer" | "seller" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  role: Role;
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
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    providers: { type: [String], default: [] },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const User: Model<IUser> = (models.User as Model<IUser>) ?? model<IUser>("User", UserSchema);