import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ReviewForm = ({ mealId, refetch }) => {
  const { currentUser, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !token) {
      toast.error("Please log in to submit a review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting review for meal:", mealId);
      const res = await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          mealId,
          userEmail: currentUser.email,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.insertedId || res.data?.success) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        refetch(); 
      } else {
        toast.error(res.data?.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      const message =
        err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 400
          ? "You have already submitted a review for this meal."
          : err.response?.data?.message || "Could not submit review.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">Write a Review</h4>
      <div className="mb-4">
        <label className="block text-base-content dark:text-base-content-dark mb-2" htmlFor="rating">
          Rating (1-5)
        </label>
        <input
          id="rating"
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full p-2 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark rounded shadow-inner focus:outline-none focus:outline-primary dark:focus:outline-primary-dark"
          required
          disabled={submitting}
          aria-label="Rating (1 to 5)"
        />
      </div>
      <div className="mb-4">
        <label className="block text-base-content dark:text-base-content-dark mb-2" htmlFor="comment">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark rounded shadow-inner focus:outline-none focus:outline-primary dark:focus:outline-primary-dark"
          rows="4"
          required
          disabled={submitting}
          aria-label="Review comment"
        />
      </div>
      <button
        type="submit"
        className="btn bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
        disabled={submitting}
        aria-label="Submit review"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;