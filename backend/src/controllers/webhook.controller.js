import { StatusCodes } from "http-status-codes";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { handleCheckoutCompleted } from "../services/payment.service.js";

export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object);
  }

  return res.status(StatusCodes.OK).json({ received: true });
};
