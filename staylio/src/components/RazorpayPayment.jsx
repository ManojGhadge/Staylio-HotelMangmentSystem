import React, { useState } from "react";

const RazorpayPayment = ({
  amount,
  user,
  onSuccess,
  onFailure
}) => {
  const [paymentId, setPaymentId] = useState("");

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startPayment = async () => {
    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!loaded) {
      alert("Failed to load Razorpay SDK. Check your network.");
      return;
    }

    const options = {
      key: "rzp_test_JhQ3fuFClaPubE",
      amount: amount * 100, // Convert to paisa
      currency: "INR",
      name: "Staylio Booking",
      description: "Hotel Booking Payment",
      image: "",
      handler: function (response) {
        const id = response.razorpay_payment_id;
        setPaymentId(id);
        if (onSuccess) onSuccess(id);
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.contact || "",
      },
      theme: {
        color: "#0d94fb",
      },
    };

    const paymentObj = new window.Razorpay(options);

    paymentObj.on("payment.failed", function (response) {
      if (onFailure) onFailure(response.error);
    });

    paymentObj.open();
  };

  return (
    <div>
      <button
        onClick={startPayment}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        Pay ₹{amount.toLocaleString('en-IN')}
      </button>

      {paymentId && (
        <p className="text-green-600 text-sm mt-2 text-center">
          Payment Successful! ID: {paymentId}
        </p>
      )}
    </div>
  );
};

export default RazorpayPayment;
