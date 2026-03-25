import { api } from "./client";

export const listProductsRequest = async () => {
  const { data } = await api.get("/products");
  return data.products;
};
