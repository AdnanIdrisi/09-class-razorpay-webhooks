import Razorpay from 'razorpay';

// One instance for the whole app. key_secret never leaves the server.

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpay;