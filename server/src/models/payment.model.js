import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId:   { type: String, required: true, unique: true },
    paymentId: { type: String },
    signature: { type: String },
    amount:    { type: Number, required: true },   // in paise
    currency:  { type: String, default: "INR" },
    product:   { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    status:    { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    note:    { type: String, default: "None" },
    capturedAt: { type: Date },
  },
  { timestamps: true }
);

const paymentModel = mongoose.model("payment", paymentSchema);

export default paymentModel;