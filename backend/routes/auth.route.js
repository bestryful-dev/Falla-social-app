import express from "express";
import {signup, login , logout, getMe, verifyEmail} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.get("/health", (req,res)=>{
    res.status(200).json({message: "OK"})
})
router.get("/me",protectRoute,getMe)
router.post("/signup",signup);
router.post("/verify-email", verifyEmail);
router.post("/login",login);
router.post("/logout",logout);

export default router;