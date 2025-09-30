import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import LoadingSpinner from "../components/LoadingSpinner";

const stripePromise = loadStripe("pk_test_51RmF1OPEpJCfGx2KWso0MxQZbWBEW1QneuhL73PXFNr9i9qBJ7drH66FSwss8C4VXhfNHKpOtBU81p3YalnTzlBX00s8r4mix5");

const packageDetails = {
  silver: { name: "Silver", price: 999, description: "Access to premium meal features and upcoming meals." },
  gold: { name: "Gold", price: 1999, description: "Enhanced meal options and priority support." },
  platinum: { name: "Platinum", price: 2999, description: "Full access with exclusive perks." },
};

const Checkout = () => {
  const { packageName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  console.log("Checkout.jsx: currentUser:", { email: currentUser?.email, uid: currentUser?.uid }, "packageName:", packageName);
  console.log("Checkout.jsx: selectedPackage:", packageDetails[packageName?.toLowerCase()]);

  const selectedPackage = packageDetails[packageName?.toLowerCase()];

  useEffect(() => {
    if (!selectedPackage) {
      console.log("Invalid package, redirecting to /");
      toast.error("Invalid package selected!");
      navigate("/", { replace: true });
    }
  }, [selectedPackage, navigate]);

  if (!currentUser) {
    console.log("No currentUser, redirecting to /login with state:", { from: location.pathname });
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!stripe || !elements || !selectedPackage) return;

    setProcessing(true);
    try {
      console.log("Sending to /create-payment-intent:", {
        amount: selectedPackage.price,
        email: currentUser.email,
      });
      const { data: { clientSecret } } = await axios.post(
        "https://exp-v9z4.onrender.com/create-payment-intent",
        { amount: selectedPackage.price, email: currentUser.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        }
      );

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email: currentUser.email },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const confirmPayload = {
        packageName: selectedPackage.name,
        transactionId: result.paymentIntent.id,
        userEmail: currentUser.email,
      };
      console.log("Sending to /confirm-payment:", confirmPayload);
      const { data } = await axios.post(
        "https://exp-v9z4.onrender.com/confirm-payment",
        confirmPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        }
      );

      if (data.success) {
        await Swal.fire({
          title: "Payment Successful!",
          text: `You are now a ${selectedPackage.name} member!`,
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate("/dashboard/my-profile", { replace: true });
      } else {
        throw new Error(data.message || "Payment confirmation failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!selectedPackage) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-base-100">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-base-100 shadow-xl rounded-lg p-8 max-w-lg w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Checkout: {selectedPackage.name} Package
        </h1>
        <div className="space-y-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-base-content">{selectedPackage.name}</h2>
            <p className="text-sm text-base-content/70">{selectedPackage.description}</p>
            <p className="mt-2 font-bold text-primary">${(selectedPackage.price / 100).toFixed(2)}</p>
          </div>
          <p className="text-center mb-4 text-base-content">
            Paying as <span className="font-semibold text-base-content">{currentUser.email || "Unknown User"}</span>
          </p>
          <form onSubmit={handlePayment}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-base-content">Card Details</label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1F2937",
                      "::placeholder": { color: "#6B7280" },
                    },
                    invalid: { color: "#EF4444" },
                  },
                }}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary text-white w-full hover:bg-primary/90 ${processing ? "loading" : ""}`}
              disabled={!stripe || processing || !currentUser}
            >
              {processing ? "Processing..." : `Pay $${(selectedPackage.price / 100).toFixed(2)}`}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const CheckoutWithStripe = () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);

export default CheckoutWithStripe;