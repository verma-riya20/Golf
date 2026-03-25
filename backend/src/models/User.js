import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    stripeCustomer: { type: String, default: null },
    // Golf & Charity specific fields
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null },
    selectedCharityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
    golfscores: [{ type: mongoose.Schema.Types.ObjectId, ref: "GolfScore" }],
    isSubscribed: { type: Boolean, default: false },
    subscriptionEndDate: { type: Date, default: null },
    wonDraws: [{ type: mongoose.Schema.Types.ObjectId, ref: "Winner" }]
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

export const UserModel = mongoose.model("User", userSchema);
