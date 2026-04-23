import exporess from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updatePassword,
  updateUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = new exporess.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// PROTECTED ROUTES
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateUser);
userRouter.put("/password", authMiddleware, updatePassword);

export default userRouter;
