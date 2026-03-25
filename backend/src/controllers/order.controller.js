import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createStripeCheckoutSession } from "../services/payment.service.js";
import { OrderModel } from "../models/Order.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid product id");

export const checkoutSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: objectIdSchema,
        quantity: z.number().int().min(1).max(99)
      })
    )
  })
});

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const data = await createStripeCheckoutSession({
    user: req.user,
    items: req.validated.body.items
  });

  res.status(StatusCodes.OK).json(data);
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.find({ userId: req.user.id }).sort({ createdAt: -1 });

  const response = orders.map((order) => ({
    ...order.toJSON(),
    items: order.items.map((item) => ({
      id: item._id.toString(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      product: {
        name: item.name
      }
    }))
  }));

  res.status(StatusCodes.OK).json({ orders: response });
});
