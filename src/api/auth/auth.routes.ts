import express from "express";
import {
  login,
  autoLogin,
  signup,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} from "./auth.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import { authRequestLimiter } from "../../services/rate-limiter.service";

const router = express.Router();

router.post("/auto-login", autoLogin);

router.use(authRequestLimiter);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.patch("/updatePassword", requireAuth, updatePassword);
router.post("/forgotPassword", sendPasswordResetEmail);
router.patch("/resetPassword/:token", resetPassword);

export default router;
