import { Request, Response, NextFunction } from "express";
import { AppError, asyncErrorCatcher } from "../services/error.service";
import { UserModel } from "../api/user/user.model";
import tokenService from "../services/token.service";

const requireAuth = asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
  const token = tokenService.getTokenFromRequest(req);
  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }
  const verifiedToken = await tokenService.verifyToken(token);
  if (!verifiedToken) {
    return next(new AppError("Invalid Token.", 401));
  }
  const { id, timeStamp } = verifiedToken;

  const currentUser = await UserModel.findById(id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this token does not exist.", 401));
  }

  const changedPasswordAfter = currentUser.changedPasswordAfter(timeStamp);
  if (changedPasswordAfter) {
    return next(new AppError("User recently changed password! Please log in again.", 401));
  }

  req.loggedinUserId = id;
  next();
});

const requireAdmin = asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("User not logged in", 401);
  const user = await UserModel.findById(loggedinUserId);
  if (!user) throw new AppError("User not found", 404);
  if (!user.isAdmin) throw new AppError("User not authorized", 403);
  next();
});

export { requireAuth, requireAdmin };
