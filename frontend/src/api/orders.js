import { api } from "./client";

export const createCheckoutSessionRequest = async (items) => {
  const { data } = await api.post("/orders/checkout-session", { items });
  return data;
};

export const listMyOrdersRequest = async () => {
  const { data } = await api.get("/orders/my");
  return data.orders;
};
