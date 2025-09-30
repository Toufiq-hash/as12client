import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const MealDetails = () => {
  const { id } = useParams();
  const { currentUser, token, loading: authLoading } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);

  
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  
  const { data: meal, isLoading, error: mealError, refetch } = useQuery({
    queryKey: ["meal", id],
    queryFn: async () => {
      if (!isValidObjectId(id)) {
        console.error("Invalid meal ID format:", id);
        throw new Error("Invalid meal ID format");
      }
      console.log("Fetching meal with ID:", id);
      const res = await axios.get(`${API_BASE_URL}/meals/${id}`);
      console.log("Meal response:", res.data);
      return res.data;
    },
    retry: 2,
  });

  
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      console.log("Fetching reviews for meal:", id);
      try {
        const res = await axios.get(`${API_BASE_URL}/reviews/meal/${id}`);
        console.log("Reviews response:", res.data);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Reviews fetch failed:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
          url: `${API_BASE_URL}/reviews/meal/${id}`,
        });
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60,
  });

  
  const { data: userRequests = [], isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ["userRequests", currentUser?.email, id],
    queryFn: async () => {
      if (!currentUser?.email || !token) {
        console.log("Skipping user requests fetch: Missing email or token", {
          currentUser: currentUser?.email,
          token,
        });
        return [];
      }
      console.log("Fetching user requests for email:", currentUser.email);
      const res = await axios.get(`${API_BASE_URL}/requested-meals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email: currentUser.email, page: 1, limit: 100 },
      });
      console.log("User requests response:", res.data);
      return Array.isArray(res.data.meals) ? res.data.meals : [];
    },
    enabled: !!currentUser?.email && !!token && !authLoading,
    retry: false,
    staleTime: 1000 * 60,
  });

  
  const isMealRequested = userRequests.some(
    (request) => request.mealId === id && ["pending", "paid"].includes(request.status)
  );

  
  const isMealAvailable = meal && new Date(meal.postTime) <= new Date();

  
  useEffect(() => {
    if (meal && currentUser?.email) {
      setIsLiked(Array.isArray(meal.likedBy) && meal.likedBy.includes(currentUser.email));
    } else {
      setIsLiked(false);
    }
  }, [meal, currentUser]);

  
  const handleLike = async () => {
    if (!currentUser || !token) {
      console.log("Like attempt failed: User not logged in or token missing", {
        currentUser: currentUser?.email,
        token,
        localStorageToken: localStorage.getItem("access-token"),
      });
      toast.error("Please log in to like this meal.");
      return <Navigate to="/login" replace />;
    }

    try {
      console.log("Attempting to like meal:", { mealId: id, userEmail: currentUser.email });
      const res = await axios.patch(
        `${API_BASE_URL}/meals/like/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.modifiedCount > 0 || res.data?.success) {
        setIsLiked((prev) => {
          toast.success(!prev ? "Meal liked!" : "Like removed.");
          return !prev;
        });
        refetch();
      } else {
        console.log("Like failed: No changes made", res.data);
        toast.error("No changes made.");
      }
    } catch (err) {
      console.error("Error liking meal:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        userEmail: currentUser.email,
      });
      const message =
        err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 403
          ? "You are not authorized to like this meal."
          : err.response?.status === 404
          ? "Meal not found."
          : err.response?.data?.message || "Error liking meal.";
      toast.error(message);
    }
  };

  
  const handleRequest = async () => {
    if (!currentUser || !token) {
      console.log("Meal request attempt failed: User not logged in or token missing", {
        currentUser: currentUser?.email,
        token,
        localStorageToken: localStorage.getItem("access-token"),
      });
      toast.error("Please log in to request this meal.");
      return <Navigate to="/login" replace />;
    }

    if (!isValidObjectId(id)) {
      console.error("Invalid meal ID format:", id);
      toast.error("Invalid meal ID format.");
      return;
    }

    if (!isMealAvailable) {
      console.log("Meal not available for request:", {
        mealId: id,
        postTime: meal?.postTime,
        currentTime: new Date(),
      });
      toast.error("This meal is not yet available for requests.");
      return;
    }

    setRequesting(true);
    try {
      console.log("Requesting meal:", { mealId: id, userEmail: currentUser.email });
      const res = await axios.post(
        `${API_BASE_URL}/meal-request`,
        { mealId: id, userEmail: currentUser.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.insertedId || res.data?.success) {
        console.log("Meal request successful:", res.data);
        toast.success("Meal requested successfully!");
        refetchRequests();
        refetch();
      } else {
        console.log("Meal request failed: No insertedId or success", res.data);
        toast.error(res.data?.message || "Meal request failed.");
      }
    } catch (err) {
      console.error("Could not request meal:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        userEmail: currentUser.email,
        mealId: id,
      });
      const message =
        err.response?.status === 400
          ? err.response?.data?.message || "You have already requested this meal."
          : err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 403
          ? "You are not authorized to request this meal."
          : err.response?.status === 404
          ? "Meal not found or not available."
          : err.response?.data?.message || "Could not request meal.";
      toast.error(message);
    } finally {
      setRequesting(false);
    }
  };

  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !token) {
      console.log("Review submission failed: User not logged in or token missing", {
        currentUser: currentUser?.email,
        token,
        localStorageToken: localStorage.getItem("access-token"),
      });
      toast.error("Please log in to submit a review.");
      return <Navigate to="/login" replace />;
    }
    if (rating < 1 || rating > 5) {
      console.log("Review validation failed: Invalid rating", { rating });
      toast.error("Please select a rating between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      console.log("Review validation failed: Comment is empty");
      toast.error("Please enter a comment.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting review for meal:", {
        mealId: id,
        userEmail: currentUser.email,
        rating,
        comment,
      });
      const res = await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          mealId: id,
          userEmail: currentUser.email,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.insertedId || res.data?.success) {
        console.log("Review submitted successfully:", res.data);
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        refetch();
        refetchReviews();
      } else {
        console.log("Review submission failed: No insertedId or success", res.data);
        toast.error(res.data?.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Error submitting review:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        userEmail: currentUser.email,
      });
      const message =
        err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 400
          ? err.response?.data?.message || "You have already submitted a review for this meal."
          : err.response?.status === 403
          ? "You are not authorized to submit a review."
          : err.response?.status === 404
          ? "Meal not found."
          : err.response?.data?.message || "Could not submit review.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || isLoading || requestsLoading) {
    return <LoadingSpinner />;
  }

  if (mealError) {
    console.error("Meal fetch error:", {
      status: mealError.response?.status,
      message: mealError.response?.data?.message,
    });
    return (
      <p className="text-center p-6 text-error dark:text-error-dark">
        {mealError.response?.status === 404 ? "Meal not found." : "Error loading meal."}
      </p>
    );
  }
  if (!meal) return <p className="text-center p-6 text-base-content dark:text-base-content-dark">Meal not found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 dark:bg-base-100-dark rounded-3xl shadow-xl">
      <div className="grid md:grid-cols-2 gap-8">
        <img
          src={meal.photoUrl || "/fallback-image.jpg"}
          alt={meal.title || "Meal Image"}
          className="w-full h-auto rounded-2xl shadow-lg border-base-300 dark:border-base-100-dark object-cover"
        />

        <div className="bg-base-100 dark:bg-base-100-dark p-6 rounded-2xl shadow-md border border-base-300 dark:border-base-100-dark">
          <h2 className="text-3xl font-extrabold text-base-content dark:text-base-content-dark mb-2">
            {meal.title || "Untitled Meal"}
          </h2>
          <p className="text-base-content/70 dark:text-base-content-dark mb-2 italic">
            By: {meal.distributorName || "Unknown"}
          </p>
          <p className="text-base-content dark:text-base-content-dark mb-4">
            {meal.description || "No description available."}
          </p>
          <p className="mb-2 text-base-content dark:text-base-content-dark">
            <strong>Ingredients:</strong>{" "}
            {Array.isArray(meal.ingredients) ? meal.ingredients.join(", ") : "N/A"}
          </p>
          <p className="mb-2 text-base-content dark:text-base-content-dark">
            <strong>Posted:</strong>{" "}
            {meal.postTime ? new Date(meal.postTime).toLocaleString() : "Unknown"}
          </p>
          <p className="text-xl font-bold text-primary dark:text-primary-dark">${meal.price ?? "N/A"}</p>
          <p className="text-secondary dark:text-secondary-dark text-lg">⭐ {meal.rating ?? 0}</p>
          {!isMealAvailable && (
            <p className="text-error dark:text-error-dark mt-2">
              This meal is not yet available for requests until{" "}
              {new Date(meal.postTime).toLocaleString()}.
            </p>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={handleLike}
              className={`btn ${
                isLiked
                  ? "bg-primary/20 dark:bg-primary-dark/50 text-primary dark:text-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/60"
                  : "bg-primary/10 dark:bg-primary-dark/40 text-primary dark:text-primary-dark hover:bg-primary/20 dark:hover:bg-primary-dark/50"
              } border border-primary dark:border-primary-dark shadow-inner transition-all duration-200`}
              aria-label={isLiked ? "Remove like" : "Like meal"}
              disabled={authLoading}
            >
              {isLiked ? "💖 Liked" : "❤️ Like"} ({meal.likedBy?.length || 0})
            </button>
            <button
              onClick={handleRequest}
              className={`btn ${
                isMealRequested || !isMealAvailable
                  ? "bg-base-200 dark:bg-base-200-dark text-base-content/50 dark:text-base-content-dark/80 cursor-not-allowed"
                  : "bg-primary/10 dark:bg-primary-dark/40 text-primary dark:text-primary-dark hover:bg-primary/20 dark:hover:bg-primary-dark/50"
              } border border-primary dark:border-primary-dark shadow-inner transition-all duration-200`}
              disabled={isMealRequested || requesting || authLoading || !isMealAvailable}
              aria-label={isMealRequested ? "Meal already requested" : "Request meal"}
            >
              {requesting ? "Requesting..." : isMealRequested ? "Meal Requested" : "Request Meal"}
            </button>
          </div>
        </div>
      </div>

      <hr className="my-10 border-base-300 dark:border-base-100-dark" />

      <div className="bg-base-100 dark:bg-base-100-dark p-6 rounded-xl shadow-md border border-base-300 dark:border-base-100-dark mt-10">
        <h3 className="text-2xl font-bold mb-4 text-primary dark:text-primary-dark">
          Reviews ({meal.reviews_count ?? 0})
        </h3>

        
        <form onSubmit={handleReviewSubmit} className="mb-6">
          <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">
            Write a Review
          </h4>
          {authLoading && <p className="text-primary dark:text-primary-dark">Loading authentication...</p>}
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
              className="w-full p-2 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark rounded"
              required
              disabled={submitting || authLoading}
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
              className="w-full p-2 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark rounded"
              rows="4"
              required
              disabled={submitting || authLoading}
              aria-label="Review comment"
            />
          </div>
          <button
            type="submit"
            className="btn btn-outline border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-white disabled:opacity-50"
            disabled={submitting || authLoading}
            aria-label="Submit review"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        
        {reviewsLoading ? (
          <LoadingSpinner />
        ) : reviewsError ? (
          <div className="text-center">
            <p className="text-error dark:text-error-dark mb-2">
              {reviewsError.response?.status === 404
                ? "No reviews found for this meal."
                : `Error loading reviews: ${reviewsError.response?.data?.message || reviewsError.message}`}
            </p>
            <button
              onClick={() => refetchReviews()}
              className="btn btn-sm btn-outline border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-primary dark:hover:bg-primary-dark hover:text-white"
              aria-label="Retry loading reviews"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-primary dark:text-primary-dark">No reviews yet.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <article
                key={review._id}
                className="p-4 mb-4 bg-base-100 dark:bg-base-100-dark rounded-lg shadow-md border border-base-300 dark:border-base-100-dark"
                aria-labelledby={`review-${review._id}`}
              >
                <h5
                  id={`review-${review._id}`}
                  className="text-lg font-semibold text-primary dark:text-primary-dark"
                >
                  {review.userEmail || "Anonymous"}
                </h5>
                <p className="text-secondary dark:text-secondary-dark">⭐ {review.rating}</p>
                <p className="text-base-content dark:text-base-content-dark">{review.comment}</p>
                <p className="text-xs text-base-content/50 dark:text-base-content-dark/80 mt-1">
                  Posted: {new Date(review.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDetails;