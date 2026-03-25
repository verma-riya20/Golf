import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find({})
    .select("fullName email role isSubscribed subscriptionEndDate charityPercentage selectedCharityId createdAt")
    .populate("selectedCharityId", "name")
    .sort({ createdAt: -1 });

  res.json(users);
});

export default {
  listUsers
};
