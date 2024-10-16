import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    // return res.sendStatus(403);
    return res.status(403).send("Access forbidden: No user found.");
  }
  console.log("User authenticated:", user);
  return next();
};

export default requireUser;
