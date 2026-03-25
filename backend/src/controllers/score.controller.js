import { GolfScoreModel } from "../models/GolfScore.js";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// Add golf score
export const addGolfScore = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { score, date, courseInfo } = req.body;

  // Validate input
  if (!score || score < 1 || score > 45) {
    throw new AppError("Score must be between 1 and 45 (Stableford format)", 400);
  }

  if (!date) {
    throw new AppError("Date is required", 400);
  }

  // Check user subscription
  const subscription = await UserModel.findById(userId).select("isSubscribed");
  if (!subscription?.isSubscribed) {
    throw new AppError("Only subscribed users can add scores", 403);
  }

  // Create new score
  const golfScore = await GolfScoreModel.create({
    userId,
    score,
    date: new Date(date),
    courseInfo
  });

  // Add to user's scores array (keep only latest 5)
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $push: { golfscores: golfScore._id } },
    { new: true }
  ).populate("golfscores").sort({ createdAt: -1 }).limit(5);

  res.status(201).json(golfScore);
});

// Get user's latest 5 scores
export const getUserScores = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const scores = await GolfScoreModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(scores);
});

// Update golf score
export const updateGolfScore = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { scoreId } = req.params;
  const { score, date, courseInfo } = req.body;

  // Validate input
  if (score && (score < 1 || score > 45)) {
    throw new AppError("Score must be between 1 and 45", 400);
  }

  // Check ownership
  const golfScore = await GolfScoreModel.findById(scoreId);
  if (!golfScore || golfScore.userId.toString() !== userId) {
    throw new AppError("Score not found or unauthorized", 404);
  }

  // Update
  if (score) golfScore.score = score;
  if (date) golfScore.date = new Date(date);
  if (courseInfo) golfScore.courseInfo = courseInfo;

  await golfScore.save();

  res.json(golfScore);
});

// Delete golf score
export const deleteGolfScore = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { scoreId } = req.params;

  const golfScore = await GolfScoreModel.findById(scoreId);
  if (!golfScore || golfScore.userId.toString() !== userId) {
    throw new AppError("Score not found or unauthorized", 404);
  }

  // Remove from user's scores
  await UserModel.findByIdAndUpdate(userId, {
    $pull: { golfscores: scoreId }
  });

  await GolfScoreModel.deleteOne({ _id: scoreId });

  res.json({ message: "Score deleted successfully" });
});

// Get score statistics
export const getScoreStats = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const scores = await GolfScoreModel.find({ userId }).sort({ createdAt: -1 }).limit(5);

  if (scores.length === 0) {
    return res.json({
      count: 0,
      average: 0,
      best: null,
      worst: null,
      scores: []
    });
  }

  const scoreValues = scores.map(s => s.score);
  const average = (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(2);

  res.json({
    count: scores.length,
    average: parseFloat(average),
    best: Math.max(...scoreValues),
    worst: Math.min(...scoreValues),
    scores: scores
  });
});

export default {
  addGolfScore,
  getUserScores,
  updateGolfScore,
  deleteGolfScore,
  getScoreStats
};
