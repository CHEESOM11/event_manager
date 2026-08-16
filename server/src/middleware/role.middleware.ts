import { NextFunction,  Response } from "express";
import { AuthenticationRequest } from "./auth.middleware";

export const authorize = (...roles:
    ("EVENT_CREATOR" | "EVENTEE")[]) => {
  return (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  };
};
