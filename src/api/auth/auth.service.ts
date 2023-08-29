import { User } from "../../../../shared/interfaces/user.interface";
import { UserModel } from "../user/user.model";
import { AppError } from "../../services/error.service";
import { sendEmail } from "../../services/util.service";
import crypto from "crypto";
import tokenService from "../../services/token.service";

async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  const user = await UserModel.findOne({ username }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    if (user) {
      if (user.loginAttempts >= 10 && user.lockedUntil < Date.now()) {
        user.lockedUntil = Date.now() + 60 * 60 * 1000;
        await user.save({ validateBeforeSave: false });
        throw new AppError("Too many failed login attempts. Try again in 1 hour", 400);
      }

      if (user.lockedUntil && user.lockedUntil > Date.now()) {
        const minutes = Math.ceil((user.lockedUntil - Date.now()) / 1000 / 60);
        throw new AppError(`Account locked. Try again in ${minutes} minutes`, 400);
      }

      user.loginAttempts++;
      await user.save({ validateBeforeSave: false });
    }
    throw new AppError("Incorrect username or password", 400);
  }
  const token = tokenService.signToken(user.id);

  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockedUntil = 0;
    await user.save({ validateBeforeSave: false });
  }
  return {
    user: user as unknown as User,
    token,
  };
}

async function autoLogin(loginToken: string): Promise<{ user: User; newToken: string }> {
  const verifiedToken = await tokenService.verifyToken(loginToken);
  if (!verifiedToken) throw new AppError("Invalid token", 400);
  const { id } = verifiedToken;
  const user = await UserModel.findById(id);
  if (!user) throw new AppError("User not found", 404);
  const newToken = tokenService.signToken(user.id);
  return {
    user: user as unknown as User,
    newToken,
  };
}

async function signup(user: User): Promise<{ savedUser: User; token: string }> {
  const savedUser = await UserModel.create(user);
  const token = tokenService.signToken(savedUser.id);
  return {
    savedUser: savedUser as unknown as User,
    token,
  };
}

async function updatePassword(
  loggedinUserId: string,
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string
) {
  const user = await UserModel.findById(loggedinUserId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  if (!(await user.checkPassword(currentPassword, user.password))) {
    throw new AppError("Incorrect current password", 400);
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  const newToken = tokenService.signToken(user.id);

  return {
    user: user as unknown as User,
    newToken,
  };
}

async function sendPasswordResetEmail(email: string, resetURL: string) {
  const user = await UserModel.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${
    resetURL + resetToken
  }.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("There was an error sending the email. Try again later!", 500);
  }
}

async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string
): Promise<{ user: User; newToken: string }> {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const newToken = tokenService.signToken(user.id);

  return {
    user: user as unknown as User,
    newToken,
  };
}

export default {
  login,
  autoLogin,
  signup,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
};
