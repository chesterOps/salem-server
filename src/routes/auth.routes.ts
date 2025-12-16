import express from "express";
import { login, logout, refresh, signup } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { setUserID } from "../middlewares/user.middleware";
import { getUser } from "../controllers/user.controller";

// Auth router
const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/signup", signup);

authRouter.post("/refresh-token", refresh);

authRouter.get("/get-profile", protect, setUserID(), getUser);

export default authRouter;
