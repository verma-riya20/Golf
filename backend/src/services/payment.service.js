import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { ProductModel } from "../models/Product.js";
import { OrderModel } from "../models/Order.js";
import { AppError } from "../utils/appError.js";

export const createStripeCheckoutSession = async ({ user, items }) => {
  if (!items?.length) {
    throw new AppError("Cart cannot be empty", 400);
  }

  const productIds = items.map((item) => item.productId);
  const uniqueProductIds = [...new Set(productIds)];
  const products = await ProductModel.find({ _id: { $in: uniqueProductIds }, isActive: true });

  const productMap = new Map(products.map((p) => [p.id.toString(), p]));

  const hasInvalidItem = items.some((item) => !productMap.get(item.productId));
  if (hasInvalidItem) {
    throw new AppError("One or more products are invalid", 400);
  }

  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const quantity = Math.max(1, item.quantity);
    const lineTotal = product.priceCents * quantity;

    return {
      productId: product.id.toString(),
      quantity,
      unitPrice: product.priceCents,
      lineTotal,
      name: product.name,
      currency: product.currency
    };
  });

  const totalCents = normalizedItems.reduce((sum, i) => sum + i.lineTotal, 0);

  const order = await OrderModel.create({
    userId: user.id,
    status: "PENDING",
    totalCents,
    currency: "usd",
    items: normalizedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal
    }))
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: normalizedItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.currency,
        product_data: {
          name: item.name
        },
        unit_amount: item.unitPrice
      }
    })),
    success_url: env.STRIPE_SUCCESS_URL,
    cancel_url: env.STRIPE_CANCEL_URL,
    metadata: {
      orderId: order.id.toString(),
      userId: user.id.toString()
    }
  });

  await OrderModel.findByIdAndUpdate(order.id, { stripeCheckoutId: session.id });

  return { sessionId: session.id, url: session.url, orderId: order.id.toString() };
};

export const handleCheckoutCompleted = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await OrderModel.findByIdAndUpdate(orderId, {
    status: "PAID",
    stripePaymentIntentId: session.payment_intent?.toString() || null
  });
};
