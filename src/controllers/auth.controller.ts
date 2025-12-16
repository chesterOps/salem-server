import cookieConfig from "../config/cookie";
import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  fetchRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";

// Verify front url
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET OR REFRESH_TOKEN_SECRET not set in environment variables"
  );
}

export const login = catchAsync(async (req, res, next) => {
  // Get fields
  const { email, password } = req.body;

  // Check if login credentials are empty
  if (!email || !password)
    return next(new AppError("Please provide login credentials", 400));

  // Fetch user
  const user = await User.findOne({ email }).select("+password");

  // Verify user
  if (!user || !(await user.verifyPassword(password, user.password)))
    return next(new AppError("Incorrect login details", 400));

  // Create data object
  const data = user.toObject();

  // Create access token
  const accessToken = generateAccessToken({
    id: data._id.toString(),
    role: data.role,
  });

  // Create refresh token
  const refreshToken = generateRefreshToken({
    id: data._id.toString(),
    role: data.role,
  });

  // Update user with refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Add refresh token to response
  res.cookie("refresh-token", refreshToken, cookieConfig);

  // Send response
  res.status(200).json({
    status: "success",
    message: "Login successful",
    accessToken,
  });
});

// Signup
export const signup = catchAsync(async (req, res, next) => {
  // Get fields
  const { password, firstName, lastName, email } = req.body;

  // Check if fields are empty
  if (!password || !email || !firstName || !lastName)
    return next(new AppError("All fields are required", 400));

  // Check if email or phone number exists in the database
  const existingUser = await User.findOne({ email });

  if (existingUser) return next(new AppError("Email already exists", 400));

  // Create user
  const newUser = await User.create({
    password,
    email,
    firstName,
    lastName,
  });

  // Create access token
  const accessToken = generateAccessToken({
    id: newUser._id.toString(),
    role: newUser.role,
  });

  // Create refresh token
  const refreshToken = generateRefreshToken({
    id: newUser._id.toString(),
    role: newUser.role,
  });

  // Update user with refresh token
  newUser.refreshToken = refreshToken;
  await newUser.save();

  // Add refresh token to response
  res.cookie("refresh-token", refreshToken, cookieConfig);

  // Send response
  res.status(201).json({
    status: "success",
    message: "Signup successful",
    accessToken: accessToken,
  });
});

// Logout
export const logout = catchAsync(async (req, res, _next) => {
  // Get refresh token
  const refreshToken = fetchRefreshToken(req);

  // Check for token and update user
  if (refreshToken) {
    try {
      const decodedToken = verifyRefreshToken(refreshToken);
      // Get user id
      const userID = decodedToken.id;
      // Update user
      await User.findByIdAndUpdate(userID, { $unset: { refreshToken: 1 } });
    } catch (_err) {
      // Token may be expired or tampered with
      console.warn("Invalid refresh token during logout:");
    }
  }
  // Clear cookie
  res.clearCookie("refresh-token", cookieConfig);
  // Send response
  res.sendStatus(204);
});

export const refresh = catchAsync(async (req, res, next) => {
  // Get refresh token
  const refreshToken = fetchRefreshToken(req);

  // Check for refresh token
  if (!refreshToken)
    return next(new AppError("Unauthorized. Please log in.", 401));

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token.", 403));
  }

  // Find user
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError("Forbidden. Invalid session.", 403));
  }
  // Generate new tokens
  const newAccessToken = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    id: user._id.toString(),
    role: user.role,
  });

  // Save new refresh token
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  // Set new refresh token in cookie
  res.cookie("refresh-token", newRefreshToken, cookieConfig);

  // Send response
  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});
