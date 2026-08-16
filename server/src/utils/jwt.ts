import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "EVENT_CREATOR" | "EVENTEE";
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
