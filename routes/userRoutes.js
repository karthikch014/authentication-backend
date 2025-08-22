import express from "express";
import { getUserDataController } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.get('/data', verifyToken , getUserDataController);

export default userRouter;