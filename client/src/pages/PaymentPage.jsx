import { useState } from "react";
import { api } from "../api/client";
import { getErrorMessage } from "../utils/auth";

function PaymentPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const productId =
    import.meta.env.VITE_PRODUCT_ID || "64a0f1e7c3b8f5d2e4a1b2c3";

  async function startPayment() {
    setLoading(true);
    setStatus("");
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await api.post(
        `/payment/create/order/${productId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!window.Razorpay) throw new Error("Razorpay Checkout is not loaded.");
      const checkout = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Kapda Co.",
        description: "Everyday essentials",
        handler: async (response) => {
          console.log("Payment response:", response);
          setStatus("Payment verified successfully.");
        },
      });
      checkout.on("payment.failed", () =>
        setStatus("Payment was not completed."),
      );
      checkout.open();
    } catch (requestError) {
      setStatus(
        requestError.message === "Razorpay Checkout is not loaded."
          ? requestError.message
          : getErrorMessage(requestError),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="payment-page">
      <div className="payment-copy">
        <p className="eyebrow">Demo checkout</p>
        <h1>
          Make room for
          <br />
          <em>the good stuff.</em>
        </h1>
        <p>
          One simple payment flow, ready to connect to your Razorpay account.
        </p>
      </div>
      <div className="product-panel">
        <div className="product-image">
          <span>KC</span>
        </div>
        <div className="product-details">
          <div>
            <p className="eyebrow">Featured essential</p>
            <h2>Canvas carryall</h2>
            <p>Strong, spacious, and made for the daily commute.</p>
          </div>
          <strong>₹ 1,499</strong>
        </div>
        <button
          className="button button-primary button-full"
          onClick={startPayment}
          disabled={loading}
        >
          {loading ? "Preparing checkout..." : "Pay securely"}
        </button>
        {status && <p className="status-message">{status}</p>}
        <p className="secure-note">Secured by Razorpay · Demo product</p>
      </div>
    </section>
  );
}

export default PaymentPage;
