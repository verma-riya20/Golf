import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    planType: { type: String, enum: ["MONTHLY", "YEARLY"], required: true },
    price: { type: Number, required: true }, // in cents
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "CANCELLED", "LAPSED"], default: "ACTIVE" },
    startDate: { type: Date, default: Date.now },
    renewalDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    stripeSubscriptionId: { type: String, default: null },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
    charityAmount: { type: Number, default: 0 }, // in cents
    autoRenew: { type: Boolean, default: true }
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

export const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
