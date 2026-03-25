import { RefreshTokenModel } from "../models/RefreshToken.js";
import { UserModel } from "../models/User.js";
import { hashValue, compareHash } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

const parseTtlMs = (ttl) => {
  const match = ttl.match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
};

export const registerUser = async ({ email, password, fullName }) => {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashValue(password);

  const user = await UserModel.create({
    email,
    passwordHash,
    fullName
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await compareHash(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};

export const issueTokens = async (user, refreshTtl) => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email, role: user.role });
  const tokenHash = await hashValue(refreshToken);

  await RefreshTokenModel.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + parseTtlMs(refreshTtl))
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (incomingToken, refreshTtl) => {
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await UserModel.findById(payload.sub);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const tokens = await RefreshTokenModel.find({ userId: user.id, expiresAt: { $gt: new Date() } });

  let matchedId = null;
  for (const token of tokens) {
    const ok = await compareHash(incomingToken, token.tokenHash);
    if (ok) {
      matchedId = token.id;
      break;
    }
  }

  if (!matchedId) {
    throw new AppError("Invalid refresh token", 401);
  }

  await RefreshTokenModel.findByIdAndDelete(matchedId);

  const fresh = await issueTokens(user, refreshTtl);
  return { user, ...fresh };
};

export const revokeRefreshToken = async (incomingToken) => {
  if (!incomingToken) return;

  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    return;
  }

  const tokens = await RefreshTokenModel.find({ userId: payload.sub });

  for (const token of tokens) {
    const ok = await compareHash(incomingToken, token.tokenHash);
    if (ok) {
      await RefreshTokenModel.findByIdAndDelete(token.id);
      return;
    }
  }
};
