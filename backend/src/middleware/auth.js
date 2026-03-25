import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      userId: payload.sub,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
  }
  next();
};
