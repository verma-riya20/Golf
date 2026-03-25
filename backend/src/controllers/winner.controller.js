import { WinnerModel } from "../models/Winner.js";
import { UserModel } from "../models/User.js";
import { DrawModel } from "../models/Draw.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// Submit proof for winner verification
export const submitWinnerProof = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { winnerId } = req.params;
  const { proofScreenshotUrl } = req.body;

  const winner = await WinnerModel.findById(winnerId);
  if (!winner || winner.userId.toString() !== userId) {
    throw new AppError("Winner not found or unauthorized", 404);
  }

  if (winner.verificationStatus !== "PENDING") {
    throw new AppError("This winner submission has already been processed", 400);
  }

  winner.proofScreenshotUrl = proofScreenshotUrl;
  await winner.save();

  res.json(winner);
});

// Get winner details
export const getWinner = asyncHandler(async (req, res) => {
  const { winnerId } = req.params;

  const winner = await WinnerModel.findById(winnerId)
    .populate("userId", "fullName email")
    .populate("drawId");

  if (!winner) {
    throw new AppError("Winner not found", 404);
  }

  res.json(winner);
});

// Get user's wins
export const getUserWins = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const winners = await WinnerModel.find({ userId })
    .populate("drawId")
    .sort({ createdAt: -1 });

  res.json(winners);
});

// Admin: Get all winners pending verification
export const getPendingWinners = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can view pending winners", 403);
  }

  const winners = await WinnerModel.find({ verificationStatus: "PENDING" })
    .populate("userId", "fullName email")
    .populate("drawId")
    .sort({ createdAt: 1 });

  res.json(winners);
});

// Admin: Approve winner
export const approveWinner = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { winnerId } = req.params;
  const { rejectionReason } = req.body;

  // Check admin role
  const admin = await UserModel.findById(userId);
  if (!admin || admin.role !== "ADMIN") {
    throw new AppError("Only admins can approve winners", 403);
  }

  const winner = await WinnerModel.findById(winnerId);
  if (!winner) {
    throw new AppError("Winner not found", 404);
  }

  if (winner.verificationStatus !== "PENDING") {
    throw new AppError("This winner has already been processed", 400);
  }

  winner.verificationStatus = "APPROVED";
  winner.approvedBy = userId;
  winner.paymentStatus = "PENDING";
  await winner.save();

  res.json(winner);
});

// Admin: Reject winner
export const rejectWinner = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { winnerId } = req.params;
  const { rejectionReason } = req.body;

  // Check admin role
  const admin = await UserModel.findById(userId);
  if (!admin || admin.role !== "ADMIN") {
    throw new AppError("Only admins can reject winners", 403);
  }

  if (!rejectionReason) {
    throw new AppError("Rejection reason is required", 400);
  }

  const winner = await WinnerModel.findById(winnerId);
  if (!winner) {
    throw new AppError("Winner not found", 404);
  }

  if (winner.verificationStatus !== "PENDING") {
    throw new AppError("This winner has already been processed", 400);
  }

  winner.verificationStatus = "REJECTED";
  winner.rejectionReason = rejectionReason;
  winner.approvedBy = userId;
  await winner.save();

  res.json(winner);
});

// Admin: Mark as paid
export const markWinnerAsPaid = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { winnerId } = req.params;
  const { stripePayoutId } = req.body;

  // Check admin role
  const admin = await UserModel.findById(userId);
  if (!admin || admin.role !== "ADMIN") {
    throw new AppError("Only admins can mark payouts", 403);
  }

  const winner = await WinnerModel.findById(winnerId);
  if (!winner) {
    throw new AppError("Winner not found", 404);
  }

  if (winner.verificationStatus !== "APPROVED") {
    throw new AppError("Winner must be approved before marking as paid", 400);
  }

  winner.paymentStatus = "PAID";
  winner.paidAt = new Date();
  if (stripePayoutId) {
    winner.stripePayoutId = stripePayoutId;
  }
  await winner.save();

  res.json(winner);
});

// Admin: Get all winners
export const getAllWinners = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { drawId, verificationStatus, paymentStatus } = req.query;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can view all winners", 403);
  }

  let query = {};

  if (drawId) {
    query.drawId = drawId;
  }

  if (verificationStatus) {
    query.verificationStatus = verificationStatus;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  const winners = await WinnerModel.find(query)
    .populate("userId", "fullName email")
    .populate("drawId")
    .populate("approvedBy", "fullName")
    .sort({ createdAt: -1 });

  res.json(winners);
});

// Admin: Get winner statistics
export const getWinnerStats = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can view stats", 403);
  }

  const totalWinners = await WinnerModel.countDocuments();
  const pendingVerification = await WinnerModel.countDocuments({ verificationStatus: "PENDING" });
  const approvedWinners = await WinnerModel.countDocuments({ verificationStatus: "APPROVED" });
  const paidWinners = await WinnerModel.countDocuments({ paymentStatus: "PAID" });

  const totalPaid = await WinnerModel.aggregate([
    { $match: { paymentStatus: "PAID" } },
    { $group: { _id: null, total: { $sum: "$winAmount" } } }
  ]);

  const pendingPayment = await WinnerModel.aggregate([
    { $match: { paymentStatus: "PENDING", verificationStatus: "APPROVED" } },
    { $group: { _id: null, total: { $sum: "$winAmount" } } }
  ]);

  res.json({
    totalWinners,
    pendingVerification,
    approvedWinners,
    paidWinners,
    totalPaidOut: totalPaid[0]?.total || 0,
    pendingPaymentAmount: pendingPayment[0]?.total || 0
  });
});

export default {
  submitWinnerProof,
  getWinner,
  getUserWins,
  getPendingWinners,
  approveWinner,
  rejectWinner,
  markWinnerAsPaid,
  getAllWinners,
  getWinnerStats
};
