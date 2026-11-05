import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IEmailCode {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
}

const EmailCodeSchema = new Schema<IEmailCode>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  codeHash: { type: String, required: true },
  // Süresi dolan kodlar MongoDB tarafından otomatik silinir
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, required: true },
});

export const EmailCode: Model<IEmailCode> =
  (models.EmailCode as Model<IEmailCode>) ?? model<IEmailCode>("EmailCode", EmailCodeSchema);