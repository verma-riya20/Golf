import mongoose from "mongoose";

const golfScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 45 }, // Stableford format
    date: { type: Date, required: true }, // Date the score was achieved
    courseInfo: { type: String, default: null }, // Optional course name/info
    createdAt: { type: Date, default: Date.now }
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

// Ensure we only keep latest 5 scores per user
golfScoreSchema.post('save', async function(doc) {
  const count = await mongoose.model('GolfScore').countDocuments({ userId: doc.userId });
  if (count > 5) {
    const oldestScores = await mongoose.model('GolfScore')
      .find({ userId: doc.userId })
      .sort({ createdAt: 1 })
      .limit(count - 5);
    
    for (const score of oldestScores) {
      await score.deleteOne();
    }
  }
});

export const GolfScoreModel = mongoose.model("GolfScore", golfScoreSchema);
