import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "usd", lowercase: true, trim: true },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    }
  }
);

export const ProductModel = mongoose.model("Product", productSchema);
