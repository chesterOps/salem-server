import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

interface tokenPayload extends JwtPayload {
  id: string;
  role: string;
}

// Verify access token safely
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET OR REFRESH_TOKEN_SECRET not set in environment variables"
  );
}

// Generate access token
export const generateAccessToken = (data: { id: string; role: string }) => {
  return jwt.sign(data, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: "15m",
  });
};

// Generate refresh token
export const generateRefreshToken = (data: { id: string; role: string }) => {
  return jwt.sign(data, `${process.env.REFRESH_TOKEN_SECRET}`, {
    expiresIn: "24h",
  });
};

// Fetch access token
export const fetchAccessToken = (req: Request) => {
  // Authorization
  const authorization = req.headers.authorization;

  // Check for token in authorization header
  if (authorization && authorization.startsWith("Bearer"))
    return authorization.split(" ")[1];
};

// Fetch refresh token
export const fetchRefreshToken = (req: Request) => req.cookies["refresh-token"];

// Verify access token
export const verifyAccessToken = (token: string) =>
  jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`) as tokenPayload;

// Verify refresh token
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`) as tokenPayload;
