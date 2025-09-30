import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ReviewList = ({ mealId }) => {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["reviews", mealId],
    queryFn: async () => {
      console.log("Fetching reviews for meal:", mealId);
      const res = await axios.get(`${API_BASE_URL}/reviews/${mealId}`);
      console.log("Reviews response:", res.data);
      return res.data;
    },
    retry: 2,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    console.error("Reviews fetch error:", error);
    return <p className="text-red-500">Error loading reviews: {error.message}</p>;
  }
  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <article
          key={review._id}
          className="p-4 mb-4 bg-white rounded-lg shadow-md border"
          aria-labelledby={`review-${review._id}`}
        >
          <h5
            id={`review-${review._id}`}
            className="text-lg font-semibold text-indigo-700"
          >
            {review.userEmail || "Anonymous"}
          </h5>
          <p className="text-yellow-500">⭐ {review.rating}</p>
          <p className="text-gray-700">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-1">
            Posted: {new Date(review.createdAt).toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
};


export default ReviewList;