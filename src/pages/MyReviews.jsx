import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const MyReviews = () => {
  const { currentUser, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!currentUser?.email || !token) {
      console.error("Cannot fetch reviews: missing email or token", {
        email: currentUser?.email,
        token: token ? "Present" : "Missing",
      });
      toast.error("Please log in to view your reviews");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const email = encodeURIComponent(currentUser.email.toLowerCase());
      console.log(`Fetching reviews for email: ${email}, token: ${token.slice(0, 10)}...`);
      const res = await axios.get(
        `https://exp-v9z4.onrender.com/my-reviews?email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Reviews response:", {
        status: res.status,
        data: res.data,
      });
      const { reviews: fetchedReviews } = res.data;
      setReviews(fetchedReviews || []);
      if (fetchedReviews.length === 0) {
        console.warn(`No reviews found for ${email}`);
      }
    } catch (err) {
      console.error("Error fetching reviews:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        email: currentUser.email,
      });
      toast.error(err.response?.data?.message || "Failed to load reviews");
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
      fetchReviews();
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
        timeZone: "Asia/Dhaka", 
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-6 min-h-screen bg-base-100">
      <motion.h2
        className="text-2xl font-bold mb-4 text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Reviews
      </motion.h2>

      {loading ? (
        <div className="animate-pulse overflow-x-auto">
          <div className="h-4 bg-base-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-base-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-base-200 rounded w-2/3"></div>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-base-content/70">
          You haven't submitted any reviews.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border border-base-300" role="grid">
            <thead className="bg-base-200 text-base-content font-semibold">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Meal</th>
                <th scope="col">Rating</th>
                <th scope="col">Comment</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, idx) => (
                <motion.tr
                  key={review._id}
                  role="row"
                  className="text-base-content hover:bg-base-200/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <td>{idx + 1}</td>
                  <td>{review.mealTitle}</td>
                  <td>{review.rating} / 5</td>
                  <td>{review.comment}</td>
                  <td>{formatDate(review.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyReviews;