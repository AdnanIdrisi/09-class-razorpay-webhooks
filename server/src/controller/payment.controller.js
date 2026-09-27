import razorpay from "../config/razorpay.js";
import paymentModel from "../models/payment.model.js";
import crypto from "crypto";
import productModel from "../models/product.model.js";
import Razorpay from "razorpay";

// POST /create/order/:productId   → steps 1–5
export async function createOrder(req, res) {
  // Price comes from OUR database — never from req.body
  //   const product = await productModel.findById(req.params.productId);
  //   if (!product) return res.status(404).json({ message: "Product not found" });

  // Step 2–3: ask Razorpay for an order. Amount is in paise.
  const order = await razorpay.orders.create({
    amount: 1000 * 100, // ₹1000 in paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    // notes: { productId: String(product._id) },
  });

  // Step 4: a pending record that ties order → product → user
  await paymentModel.create({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    product: "64a0f1e7c3b8f5d2e4a1b2c3",
    user: req.user._id,
    status: "pending",
  });

  // Step 5: send the browser only what checkout needs
  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

export async function verifyPayment(req, res) {
  const { orderId, paymentId, signature } = req.body;

  // Step 1: verify the signature
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Step 2: update the payment status
  const payment = await paymentModel.findOne({ orderId });
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  payment.status = "completed";
  await payment.save();

  res.json({ message: "Payment verified successfully" });
}

export async function verifyPaymentByRazorpay(req, res) {
  try {
    const webhookBody = req.body;
    const webhookSignature = req.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (
      !Razorpay.validateWebhookSignature(
        JSON.stringify(webhookBody),
        webhookSignature,
        webhookSecret,
      )
    ) {
      console.error("Webhook signature is invalid.");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const paymentId = webhookBody.payload.payment.entity.id;
    const orderId = webhookBody.payload.payment.entity.order_id;
    const amount = webhookBody.payload.payment.entity.amount;
    const currency = webhookBody.payload.payment.entity.currency;
    const status = webhookBody.payload.payment.entity.status;
    const event = webhookBody.event;

    console.log("Received Razorpay webhook event:", event);

    console.log({
      paymentId,
      orderId,
      amount,
      currency,
      status,
    });

    if (!paymentId || !orderId || !amount || !currency || !status) {
      return res.status(400).json({
        message: "Missing required payment details in webhook payload",
      });
    }

    const payment = await paymentModel.findOne({
      orderId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (event === "payment.captured" && status === "captured") {
      console.log("Payment captured successfully for order:", orderId);

      if (payment.amount !== amount) {
        console.error("Payment amount mismatch", {
          expected: payment.amount,
          received: amount,
        });

        return res.status(400).json({
          message: "Payment amount mismatch",
        });
      }

      if (payment.currency !== currency) {
        return res.status(400).json({
          message: "Payment currency mismatch",
        });
      }

      if (payment.status === "completed") {
        return res.status(200).json({
          message: "Payment already processed",
        });
      }

      payment.status = "completed";
      payment.paymentId = paymentId;
      payment.note = "Payment captured via Razorpay webhook";
      payment.capturedAt = new Date();

      await payment.save();
      return res.status(200).json({
        message: "Payment captured and verified successfully",
      });
    } else {
      console.warn("Received unexpected webhook event or status:", {
        event,
        status,
      });
      return res.status(400).json({
        message: "Unexpected webhook event or status",
      });
    }
  } catch (error) {
    console.error("Error in verifyPaymentByRazorpay:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
