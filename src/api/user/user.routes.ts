import express from "express";
import {
  getUserById,
  getUserByUsername,
  getUsers,
  removeUser,
  updateUser,
  addUser,
  updateLoggedInUser,
  removeLoggedInUser,
  addFollowings,
  removeFollowings,
  addFollowingsFromPost,
  removeFollowingsFromPost,
} from "./user.controller";
import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

router.use(requireAuth);
router.post("/:id/following", addFollowings);
router.delete("/:id/following", removeFollowings);
router.post("/:userId/following/:postId/fromPost", addFollowingsFromPost);
router.delete("/:userId/following/:postId/fromPost", removeFollowingsFromPost);
router.patch("/loggedinUser", updateLoggedInUser);
router.delete("/loggedinUser", removeLoggedInUser);

router.use(requireAdmin);
router.post("/", addUser);
router.patch("/:id", updateUser);
router.delete("/:id", removeUser);

export default router;
