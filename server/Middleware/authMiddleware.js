import jwt from "jsonwebtoken";
import db from "../db.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await db.User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = {
      ...user,
      id: String(user._id),
    };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;
