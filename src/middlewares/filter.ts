import { Request, Response, NextFunction } from "express";

export default function filter(...fieldsToRemove: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Create a shallow copy to avoid mutating while iterating
    const newBody = { ...req.body };

    // Remove unwanted fields
    fieldsToRemove.forEach((field) => {
      if (field in newBody) delete newBody[field];
    });

    // Replace request body
    req.body = newBody;

    next();
  };
}
