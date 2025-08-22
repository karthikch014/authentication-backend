import express from "express";
import { loginController, logoutController, registerController, resetOtpController, resetPasswordController } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post('/register', registerController);

authRouter.post('/login',loginController);

authRouter.post('/logout',logoutController);

authRouter.post('/send-otp', resetOtpController);

authRouter.post('/reset-password', resetPasswordController);

export default authRouter;