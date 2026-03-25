import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import {
  registerUser,
  loginUser,
  issueTokens,
  rotateRefreshToken,
  revokeRefreshToken
} from "../services/auth.service.js";
import { UserModel } from "../models/User.js";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth"
};

const sanitizeUser = (user) => ({
  id: user.id || user._id?.toString(),
  email: user.email,
  fullName: user.fullName,
  role: user.role
});

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.validated.body);
  const { accessToken, refreshToken } = await issueTokens(user, env.REFRESH_TOKEN_TTL);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(StatusCodes.CREATED).json({
    user: sanitizeUser(user),
    accessToken
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.validated.body);
  const { accessToken, refreshToken } = await issueTokens(user, env.REFRESH_TOKEN_TTL);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(StatusCodes.OK).json({
    user: sanitizeUser(user),
    accessToken
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  const { user, accessToken, refreshToken } = await rotateRefreshToken(token, env.REFRESH_TOKEN_TTL);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(StatusCodes.OK).json({
    user: sanitizeUser(user),
    accessToken
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  res.status(StatusCodes.OK).json({ user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  await revokeRefreshToken(token);
  res.clearCookie("refreshToken", refreshCookieOptions);
  res.status(StatusCodes.NO_CONTENT).send();
});
