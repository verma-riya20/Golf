import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchType: { type: String, enum: ["5-MATCH", "4-MATCH", "3-MATCH"], required: true },
    winAmount: { type: Number, required: true }, // in cents
    proofScreenshotUrl: { type: String, default: null }, // Screenshot of the scores
    verificationStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    paymentStatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin who approved
    rejectionReason: { type: String, default: null },
    paidAt: { type: Date, default: null },
    stripePayoutId: { type: String, default: null }
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

winnerSchema.index({ userId: 1, drawId: 1 });
winnerSchema.index({ verificationStatus: 1, paymentStatus: 1 });

export const WinnerModel = mongoose.model("Winner", winnerSchema);
