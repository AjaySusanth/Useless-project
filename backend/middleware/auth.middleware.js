import jwt from "jsonwebtoken";
import { User } from "../models/models.js";

export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};