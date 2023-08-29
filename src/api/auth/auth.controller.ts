import { Request, Response } from "express";
import { User } from "../../../../shared/interfaces/user.interface";
import authService from "./auth.service";
import { AppError, asyncErrorCatcher } from "../../services/error.service";

const login = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const { user, token } = await authService.login(username, password);

  _sendUserTokenSuccessResponse(res, token, user, 200);
});

const autoLogin = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { loginToken } = req.cookies;
  if (!loginToken) throw new AppError("User not logged in", 401);
  const { user, newToken } = await authService.autoLogin(loginToken);

  _sendUserTokenSuccessResponse(res, newToken, user, 200);
});

const signup = asyncErrorCatcher(async (req: Request, res: Response) => {
  const user = req.body as unknown as User;
  const { savedUser, token } = await authService.signup(user);

  _sendUserTokenSuccessResponse(res, token, savedUser, 201);
});

const logout = asyncErrorCatcher(async (req: Request, res: Response) => {
  res.clearCookie("loginToken");
  res.send({
    status: "success",
    data: {
      msg: "Logged out successfully",
    },
  });
});

const updatePassword = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("User not logged in", 401);
  const { user, newToken } = await authService.updatePassword(
    loggedinUserId,
    currentPassword,
    newPassword,
    newPasswordConfirm
  );

  _sendUserTokenSuccessResponse(res, newToken, user, 200);
});

const sendPasswordResetEmail = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);
  const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/`;
  await authService.sendPasswordResetEmail(email, resetURL);
  res.status(200).json({
    status: "success",
    message: "Password reset email sent successfully",
  });
});

const resetPassword = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  const { user, newToken } = await authService.resetPassword(token, password, passwordConfirm);

  _sendUserTokenSuccessResponse(res, newToken, user, 200);
});

const _sendUserTokenSuccessResponse = (
  res: Response,
  token: string,
  user: User,
  status: number
) => {
  res.cookie("loginToken", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(status).json({
    status: "success",
    token,
    data: user,
  });
};

export { login, autoLogin, signup, logout, sendPasswordResetEmail, resetPassword, updatePassword };
