import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    drawMonth: { type: Date, required: true }, // Month of the draw (first day of month)
    status: { type: String, enum: ["DRAFT", "SIMULATED", "PUBLISHED"], default: "DRAFT" },
    drawType: { type: String, enum: ["RANDOM", "ALGORITHMIC"], default: "RANDOM" }, // Random vs weighted by scores
    winningNumbers: [{ type: Number, min: 1, max: 45 }], // 5 numbers for 5-match draw
    totalPrizePool: { type: Number, default: 0 }, // in cents
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    participantCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    simulationResults: { type: Object, default: null }, // Store simulation data
    carryoverAmount: { type: Number, default: 0 } // Jackpot carryover from previous month
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

export const DrawModel = mongoose.model("Draw", drawSchema);
