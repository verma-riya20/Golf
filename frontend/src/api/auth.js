import { api } from "./client";

export const registerRequest = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const loginRequest = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const meRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};
