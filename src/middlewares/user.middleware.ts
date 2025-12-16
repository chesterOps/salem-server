import { Request, Response, NextFunction } from "express";

// Set user ID
export const setUserID =
  (type: "param" | "field" = "param") =>
  (req: Request, res: Response, next: NextFunction) => {
    // Set user id
    if (type === "param") req.params.id = res.locals.user._id;
    if (type === "field") req.body.user = res.locals.user._id;

    // Next middleware
    next();
  };
