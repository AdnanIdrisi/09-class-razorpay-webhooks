import {Router} from "express";
import express from "express";
import { createOrder, verifyPayment, verifyPaymentByRazorpay } from "../controller/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/create/order/:productId", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.post("/verify-razorpay", verifyPaymentByRazorpay); // New route for Razorpay verification

export default router;