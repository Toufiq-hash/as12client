import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const PaymentHistory = () => {
  const { currentUser, token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    if (!currentUser?.email || !token) {
      console.error("Cannot fetch payments: missing email or token", {
        email: currentUser?.email,
        token: token ? "Present" : "Missing",
      });
      toast.error("Please log in to view payment history");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const email = encodeURIComponent(currentUser.email.toLowerCase());
      console.log(`Fetching payments for email: ${email}, token: ${token.slice(0, 10)}...`);
      const res = await axios.get(
        `https://exp-v9z4.onrender.com/payments?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Payments response:", {
        status: res.status,
        data: res.data,
      });
      const { payments: fetchedPayments } = res.data;
      setPayments(fetchedPayments || []);
      if (fetchedPayments.length === 0) {
        console.warn(`No payments found for ${email}`);
      }
    } catch (err) {
      console.error("Error fetching payments:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        email: currentUser.email,
      });
      toast.error(err.response?.data?.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email && token) {
      console.log("useEffect triggered with:", {
        email: currentUser.email,
        token: token.slice(0, 10) + "...",
      });
      fetchPayments();
    }
  }, [currentUser?.email, token]);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Dhaka", // Set to +06:00 for your timezone
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-6 text-indigo-700">
      <h2 className="text-2xl font-bold mb-4">My Payment History</h2>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : payments.length === 0 ? (
        <p>You haven't made any payments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr key={payment._id}>
                  <td>{idx + 1}</td>
                  <td>{payment.packageName}</td>
                  <td>${(payment.amount / 100).toFixed(2)}</td>
                  <td className="text-xs break-all">{payment.transactionId}</td>
                  <td>{formatDate(payment.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;