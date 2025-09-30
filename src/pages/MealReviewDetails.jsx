import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const MealReviewDetails = () => {
  const { mealId } = useParams();
  const token = localStorage.getItem("access-token");

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["meal-reviews", mealId],
    queryFn: async () => {
      console.log("Fetching reviews for mealId:", mealId);
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};
      const res = await axios.get(`${API_BASE_URL}/reviews/meal/${mealId}`, config);
      console.log("Reviews response:", res.data);
      return res.data;
    },
    retry: 2,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    console.error("Reviews fetch error:", error);
    return (
      <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-error dark:text-error-dark">
          {error.response?.status === 404
            ? "Meal not found."
            : error.response?.data?.message || "Error loading reviews."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-base-100 dark:bg-base-100-dark rounded-3xl shadow-2xl border border-base-300 dark:border-base-100-dark p-8">
        <h2 className="text-3xl font-extrabold text-base-content dark:text-base-content-dark mb-6 border-b border-base-300 dark:border-base-100-dark pb-3">
          Meal Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="text-base-content/70 dark:text-base-content-dark/80 text-center py-10">
            No reviews for this meal yet.
          </p>
        ) : (
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li
                key={review._id}
                className="bg-base-200 dark:bg-base-200-dark p-6 rounded-xl shadow-md border border-base-300 dark:border-base-100-dark"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-primary dark:text-primary-dark">
                    {review.userEmail || "Unknown User"}
                  </div>
                  <div className="text-sm text-base-content/70 dark:text-base-content-dark/80">
                    Likes: {review.likes || 0}
                  </div>
                </div>
                <div className="text-secondary dark:text-secondary-dark mb-2">
                  ⭐ Rating: {review.rating || "N/A"}
                </div>
                <p className="text-base-content dark:text-base-content-dark">
                  {review.comment || "No comment"}
                </p>
                <p className="text-sm text-base-content/70 dark:text-base-content-dark/80 mt-2">
                  Posted: {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MealReviewDetails;