import { Schema, model, models, type Model } from "mongoose";

// Deneme sayaçları: süresi dolan kayıtlar MongoDB tarafından otomatik silinir
export interface IRateLimit {
  _id: string; // anahtar:pencere
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<IRateLimit> = (models.RateLimit as Model<IRateLimit>) ?? model<IRateLimit>("RateLimit", RateLimitSchema);
