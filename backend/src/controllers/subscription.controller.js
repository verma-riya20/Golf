import { SubscriptionModel } from "../models/Subscription.js";
import { UserModel } from "../models/User.js";
import { CharityModel } from "../models/Charity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import Stripe from "stripe";
import { env } from "../config/env.js";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create subscription
export const createSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { planType, charityId, charityPercentage } = req.body;

  // Validate input
  if (!planType || !["MONTHLY", "YEARLY"].includes(planType)) {
    throw new AppError("Invalid plan type", 400);
  }

  const parsedCharityPercentage = Number(charityPercentage ?? 10);
  if (Number.isNaN(parsedCharityPercentage) || parsedCharityPercentage < 10 || parsedCharityPercentage > 100) {
    throw new AppError("Charity percentage must be between 10 and 100", 400);
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  let selectedCharity = null;
  if (charityId) {
    selectedCharity = await CharityModel.findById(charityId);
    if (!selectedCharity) {
      throw new AppError("Selected charity not found", 404);
    }
  }

  // Check if user already has active subscription
  const existingSubscription = await SubscriptionModel.findOne({
    userId,
    status: "ACTIVE"
  });

  if (existingSubscription) {
    throw new AppError("User already has an active subscription", 400);
  }

  // Determine price based on plan
  const monthlyPriceCents = 2999; // $29.99
  const yearlyPriceCents = 29990; // $299.90 (10% discount)
  const price = planType === "MONTHLY" ? monthlyPriceCents : yearlyPriceCents;

  // Calculate charity amount (minimum 10%)
  const charityAmount = Math.ceil(price * (parsedCharityPercentage / 100));

  // Calculate renewal date
  const renewalDate = new Date();
  if (planType === "MONTHLY") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  const isDemoPaymentMode =
    env.PAYMENT_MODE === "demo" ||
    !process.env.STRIPE_MONTH_PLAN_ID ||
    !process.env.STRIPE_YEAR_PLAN_ID ||
    process.env.STRIPE_SECRET_KEY?.includes("replace_me");

  let stripeSubscription = null;
  if (!isDemoPaymentMode) {
    stripeSubscription = await stripeClient.subscriptions.create({
      customer: user.stripeCustomer || (await stripeClient.customers.create({ email: user.email })).id,
      items: [
        {
          price: planType === "MONTHLY" ? process.env.STRIPE_MONTH_PLAN_ID : process.env.STRIPE_YEAR_PLAN_ID
        }
      ],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"]
    });
  }

  // Create subscription record
  const subscription = await SubscriptionModel.create({
    userId,
    planType,
    price,
    status: "ACTIVE",
    renewalDate,
    stripeSubscriptionId: stripeSubscription?.id || null,
    charityId: selectedCharity?._id || null,
    charityPercentage: parsedCharityPercentage,
    charityAmount
  });

  // Update user
  await UserModel.findByIdAndUpdate(userId, {
    isSubscribed: true,
    subscriptionId: subscription._id,
    subscriptionEndDate: renewalDate,
    charityPercentage: parsedCharityPercentage,
    selectedCharityId: selectedCharity?._id || user.selectedCharityId
  });

  if (selectedCharity) {
    await CharityModel.findByIdAndUpdate(selectedCharity._id, {
      $inc: {
        totalContributed: charityAmount,
        supporters: 1
      }
    });
  }

  const response = {
    subscription,
    paymentMode: isDemoPaymentMode ? "DEMO" : "LIVE"
  };

  if (!isDemoPaymentMode) {
    response.clientSecret = stripeSubscription.latest_invoice.payment_intent.client_secret;
  }

  res.json(response);
});

// Get user subscription
export const getUserSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const subscription = await SubscriptionModel.findOne({ userId });

  res.json(subscription || null);
});

// Cancel subscription
export const cancelSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const subscription = await SubscriptionModel.findOne({ userId, status: "ACTIVE" });

  if (!subscription) {
    throw new AppError("No active subscription found", 404);
  }

  // Cancel on Stripe
  if (subscription.stripeSubscriptionId) {
    await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
  }

  // Update subscription status
  subscription.status = "CANCELLED";
  subscription.endDate = new Date();
  await subscription.save();

  // Update user
  await UserModel.findByIdAndUpdate(userId, {
    isSubscribed: false,
    subscriptionEndDate: new Date()
  });

  res.json({ message: "Subscription cancelled successfully" });
});

// Check subscription status
export const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await UserModel.findById(userId).populate("selectedCharityId", "name");
  const subscription = await SubscriptionModel.findOne({ userId }).populate("charityId", "name");

  let status = "INACTIVE";
  let daysRemaining = null;

  if (subscription && subscription.status === "ACTIVE") {
    status = "ACTIVE";
    const today = new Date();
    daysRemaining = Math.ceil((subscription.renewalDate - today) / (1000 * 60 * 60 * 24));
  }

  const subscriptionJson = subscription
    ? {
        ...subscription.toJSON(),
        charityName: subscription.charityId?.name || user.selectedCharityId?.name || null
      }
    : null;

  res.json({
    isSubscribed: user.isSubscribed,
    status,
    subscription: subscriptionJson,
    daysRemaining
  });
});

export default {
  createSubscription,
  getUserSubscription,
  cancelSubscription,
  checkSubscriptionStatus
};
