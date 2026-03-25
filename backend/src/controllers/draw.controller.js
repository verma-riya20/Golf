import { DrawModel } from "../models/Draw.js";
import { WinnerModel } from "../models/Winner.js";
import { SubscriptionModel } from "../models/Subscription.js";
import { GolfScoreModel } from "../models/GolfScore.js";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// Generate random numbers for draw
const generateRandomNumbers = (count = 5, max = 45) => {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * max) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

// Generate numbers weighted by scores
const generateWeightedNumbers = async (participantIds, count = 5, max = 45) => {
  // For each participant, get their latest score
  const participants = await UserModel.find({ _id: { $in: participantIds } });
  
  // Create weight map
  const weights = new Map();
  for (const participant of participants) {
    const latestScore = await GolfScoreModel.findOne({ userId: participant._id }).sort({ createdAt: -1 });
    weights.set(participant._id.toString(), latestScore?.score || 25); // Default middle score if none
  }

  // Create weighted array
  const weightedArray = [];
  for (let i = 1; i <= max; i++) {
    const weight = Math.ceil(i * 1.5); // Higher numbers get more weight
    for (let j = 0; j < weight; j++) {
      weightedArray.push(i);
    }
  }

  // Pick random indices
  const numbers = [];
  while (numbers.length < count) {
    const randomIdx = Math.floor(Math.random() * weightedArray.length);
    const num = weightedArray[randomIdx];
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }

  return numbers.sort((a, b) => a - b);
};

// Create draw (Admin only)
export const createDraw = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { drawMonth, drawType } = req.body;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can create draws", 403);
  }

  // Check if draw already exists for this month
  const firstDay = new Date(drawMonth);
  firstDay.setDate(1);
  const lastDay = new Date(drawMonth);
  lastDay.setMonth(lastDay.getMonth() + 1);
  lastDay.setDate(0);

  const existingDraw = await DrawModel.findOne({
    drawMonth: { $gte: firstDay, $lte: lastDay }
  });

  if (existingDraw) {
    throw new AppError("Draw already exists for this month", 400);
  }

  // Get all active subscribers
  const activeSubscriptions = await SubscriptionModel.find({ status: "ACTIVE" });
  const participantIds = activeSubscriptions.map(sub => sub.userId);

  // Calculate total prize pool (sum of charity contributions)
  const totalCharityContributed = activeSubscriptions.reduce((sum, sub) => sum + sub.charityAmount, 0);
  const totalPrizePool = activeSubscriptions.reduce((sum, sub) => sum + (sub.price - sub.charityAmount), 0);

  const draw = await DrawModel.create({
    drawMonth: firstDay,
    drawType: drawType || "RANDOM",
    status: "DRAFT",
    participants: participantIds,
    participantCount: participantIds.length,
    totalPrizePool
  });

  res.status(201).json(draw);
});

// Simulate draw
export const simulateDraw = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { drawId } = req.params;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can simulate draws", 403);
  }

  const draw = await DrawModel.findById(drawId);
  if (!draw) {
    throw new AppError("Draw not found", 404);
  }

  // Generate winning numbers
  const winningNumbers = draw.drawType === "RANDOM"
    ? generateRandomNumbers(5)
    : await generateWeightedNumbers(draw.participants, 5);

  // Store simulation
  draw.simulationResults = {
    simulatedAt: new Date(),
    winningNumbers,
    participantCount: draw.participantCount
  };

  draw.winningNumbers = winningNumbers;
  await draw.save();

  res.json({
    draw,
    simulation: draw.simulationResults
  });
});

// Publish draw results
export const publishDrawResults = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { drawId } = req.params;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can publish results", 403);
  }

  const draw = await DrawModel.findById(drawId);
  if (!draw) {
    throw new AppError("Draw not found", 404);
  }

  if (!draw.winningNumbers || draw.winningNumbers.length === 0) {
    throw new AppError("No winning numbers generated. Run simulation first.", 400);
  }

  // Calculate prize distribution
  const prizePool = draw.totalPrizePool + draw.carryoverAmount;
  const fiveMatchPrize = Math.floor(prizePool * 0.40);
  const fourMatchPrize = Math.floor(prizePool * 0.35);
  const threeMatchPrize = Math.floor(prizePool * 0.25);

  // Check each participant's scores
  const winners = [];

  for (const participantId of draw.participants) {
    const latestScores = await GolfScoreModel.find({ userId: participantId })
      .sort({ createdAt: -1 })
      .limit(5);

    if (latestScores.length === 0) continue;

    // Get unique score values
    const scoreValues = latestScores.map(s => s.score);

    // Check matches
    const matches = draw.winningNumbers.filter(num => scoreValues.includes(num)).length;

    if (matches >= 3) {
      const matchType = matches === 5 ? "5-MATCH" : matches === 4 ? "4-MATCH" : "3-MATCH";
      const winAmount = matches === 5 ? fiveMatchPrize : matches === 4 ? fourMatchPrize : threeMatchPrize;

      const winner = await WinnerModel.create({
        drawId,
        userId: participantId,
        matchType,
        winAmount,
        verificationStatus: "PENDING",
        paymentStatus: "PENDING"
      });

      winners.push(winner);
    }
  }

  // If no 5-match winner, carry over to next month
  const fiveMatchWinners = winners.filter(w => w.matchType === "5-MATCH");
  if (fiveMatchWinners.length === 0) {
    const nextMonth = new Date(draw.drawMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const nextDraw = await DrawModel.findOne({ drawMonth: nextMonth });
    if (nextDraw) {
      nextDraw.carryoverAmount += fiveMatchPrize;
      await nextDraw.save();
    }
  }

  draw.status = "PUBLISHED";
  draw.publishedAt = new Date();
  await draw.save();

  res.json({
    draw,
    winners,
    statistics: {
      totalWinners: winners.length,
      fiveMatchWinners: fiveMatchWinners.length,
      fourMatchWinners: winners.filter(w => w.matchType === "4-MATCH").length,
      threeMatchWinners: winners.filter(w => w.matchType === "3-MATCH").length
    }
  });
});

// Get all draws
export const getDraws = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = {};
  if (status) {
    query.status = status;
  }

  const draws = await DrawModel.find(query).sort({ drawMonth: -1 });

  res.json(draws);
});

// Get draw by ID
export const getDraw = asyncHandler(async (req, res) => {
  const { drawId } = req.params;

  const draw = await DrawModel.findById(drawId).populate("participants", "fullName email");

  if (!draw) {
    throw new AppError("Draw not found", 404);
  }

  res.json(draw);
});

// Get user's draw participation
export const getUserDrawParticipation = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const draws = await DrawModel.find({ participants: userId }).sort({ drawMonth: -1 });

  // Get winners for this user
  const userWinners = await WinnerModel.find({ userId }).populate("drawId");

  res.json({
    participationCount: draws.length,
    draws,
    winners: userWinners
  });
});

export default {
  createDraw,
  simulateDraw,
  publishDrawResults,
  getDraws,
  getDraw,
  getUserDrawParticipation
};
