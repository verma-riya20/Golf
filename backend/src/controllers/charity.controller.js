import { CharityModel } from "../models/Charity.js";
import { SubscriptionModel } from "../models/Subscription.js";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// List all charities
export const listCharities = asyncHandler(async (req, res) => {
  const { search, featured } = req.query;

  let query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  const charities = await CharityModel.find(query).sort({ isFeatured: -1, name: 1 });

  res.json(charities);
});

// Get charity by ID
export const getCharity = asyncHandler(async (req, res) => {
  const { charityId } = req.params;

  const charity = await CharityModel.findById(charityId);

  if (!charity) {
    throw new AppError("Charity not found", 404);
  }

  res.json(charity);
});

// Create charity (Admin only)
export const createCharity = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { name, description, imageUrl, website, email, upcomingEvents } = req.body;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can create charities", 403);
  }

  // Validate input
  if (!name || !description) {
    throw new AppError("Name and description are required", 400);
  }

  const charity = await CharityModel.create({
    name,
    description,
    imageUrl,
    website,
    email,
    upcomingEvents: upcomingEvents || []
  });

  res.status(201).json(charity);
});

// Update charity (Admin only)
export const updateCharity = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { charityId } = req.params;
  const { name, description, imageUrl, website, email, upcomingEvents, isFeatured, isActive } = req.body;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can update charities", 403);
  }

  const charity = await CharityModel.findById(charityId);
  if (!charity) {
    throw new AppError("Charity not found", 404);
  }

  // Update fields
  if (name) charity.name = name;
  if (description) charity.description = description;
  if (imageUrl !== undefined) charity.imageUrl = imageUrl;
  if (website !== undefined) charity.website = website;
  if (email !== undefined) charity.email = email;
  if (upcomingEvents !== undefined) charity.upcomingEvents = upcomingEvents;
  if (isFeatured !== undefined) charity.isFeatured = isFeatured;
  if (isActive !== undefined) charity.isActive = isActive;

  await charity.save();

  res.json(charity);
});

// Delete charity (Admin only)
export const deleteCharity = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { charityId } = req.params;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can delete charities", 403);
  }

  const charity = await CharityModel.findByIdAndDelete(charityId);
  if (!charity) {
    throw new AppError("Charity not found", 404);
  }

  res.json({ message: "Charity deleted successfully" });
});

// Select charity for user
export const selectCharityForUser = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { charityId, charityPercentage } = req.body;

  // Validate charity exists
  const charity = await CharityModel.findById(charityId);
  if (!charity) {
    throw new AppError("Charity not found", 404);
  }

  // Validate percentage
  if (charityPercentage && (charityPercentage < 10 || charityPercentage > 100)) {
    throw new AppError("Charity percentage must be between 10 and 100", 400);
  }

  // Update user
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      selectedCharityId: charityId,
      charityPercentage: charityPercentage || 10
    },
    { new: true }
  ).populate("selectedCharityId");

  // Update subscription if active
  const subscription = await SubscriptionModel.findOne({ userId, status: "ACTIVE" });
  if (subscription) {
    const charityAmount = Math.ceil(subscription.price * ((charityPercentage || 10) / 100));
    subscription.charityPercentage = charityPercentage || 10;
    subscription.charityAmount = charityAmount;
    await subscription.save();
  }

  res.json(user);
});

// Get featured charities (for homepage)
export const getFeaturedCharities = asyncHandler(async (req, res) => {
  const charities = await CharityModel.find({ isActive: true, isFeatured: true }).limit(3);

  res.json(charities);
});

// Get charity statistics (Admin)
export const getCharityStats = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Check admin role
  const user = await UserModel.findById(userId);
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Only admins can view stats", 403);
  }

  const charities = await CharityModel.find({ isActive: true });

  const stats = charities.map(charity => ({
    id: charity._id,
    name: charity.name,
    totalContributed: charity.totalContributed,
    supporters: charity.supporters
  }));

  res.json(stats);
});

export default {
  listCharities,
  getCharity,
  createCharity,
  updateCharity,
  deleteCharity,
  selectCharityForUser,
  getFeaturedCharities,
  getCharityStats
};
