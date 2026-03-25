import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 1 }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    totalCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd", lowercase: true, trim: true },
    stripeCheckoutId: { type: String, unique: true, sparse: true, default: null },
    stripePaymentIntentId: { type: String, default: null },
    items: { type: [orderItemSchema], default: [] }
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

export const OrderModel = mongoose.model("Order", orderSchema);
