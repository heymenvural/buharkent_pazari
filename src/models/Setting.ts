import { Schema, model, models, type Model } from "mongoose";

/** Site geneli ayarlar (anahtar → değer) */
export interface ISetting {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, maxlength: 60 },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Setting: Model<ISetting> = models.Setting ?? model<ISetting>("Setting", SettingSchema);
