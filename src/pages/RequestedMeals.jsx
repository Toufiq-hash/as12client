import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useState } from "react";

const API_BASE_URL = "https://exp-v9z4.onrender.com";

const RequestedMeals = () => {
  const { currentUser, token, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10; 
  const queryClient = useQueryClient();

  
  console.log("AuthContext in RequestedMeals:", { currentUser, token, authLoading });

  const {
    data: { meals = [], totalPages = 1 } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["requested-meals", currentUser?.email?.toLowerCase(), page],
    enabled: !!currentUser?.email && !!token && !authLoading,
    queryFn: async () => {
      const email = currentUser.email.toLowerCase();
      console.log("Fetching requested meals with params:", {
        email,
        page,
        limit,
      });
      const res = await axios.get(`${API_BASE_URL}/requested-meals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email, page, limit },
      });
      console.log("Requested meals response:", res.data);
      return {
        meals: Array.isArray(res.data.meals) ? res.data.meals : [],
        totalPages: res.data.totalPages || 1,
      };
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 1000 * 60,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`${API_BASE_URL}/requested-meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries(["requested-meals", currentUser?.email?.toLowerCase(), page]);
      const previousData = queryClient.getQueryData(["requested-meals", currentUser?.email?.toLowerCase(), page]);
      queryClient.setQueryData(["requested-meals", currentUser?.email?.toLowerCase(), page], (old) => ({
        ...old,
        meals: old?.meals?.filter((meal) => meal._id !== id) || [],
      }));
      return { previousData };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(["requested-meals", currentUser?.email?.toLowerCase(), page], context.previousData);
      console.error("Error deleting request:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        requestId: id,
      });
      toast.error(
        error.response?.status === 401 || error.response?.status === 403
          ? "Unauthorized. Please log in again."
          : error.response?.status === 404
          ? "Request not found."
          : error.response?.data?.message || "Failed to delete request."
      );
    },
    onSuccess: () => {
      toast.success("Request removed successfully");
    },
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-base-100 dark:bg-base-100-dark">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary dark:text-primary-dark">
          Your Requested Meals
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-base-100 dark:bg-base-100-dark p-4 shadow rounded flex justify-between items-center"
            >
              <div className="space-y-2">
                <div className="h-4 bg-base-300 dark:bg-base-300-dark rounded w-3/4"></div>
                <div className="h-4 bg-base-300 dark:bg-base-300-dark rounded w-1/2"></div>
                <div className="h-4 bg-base-300 dark:bg-base-300-dark rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-base-300 dark:bg-base-300-dark rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Requested meals fetch error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      email: currentUser?.email,
    });
    return (
      <div className="text-center p-6 bg-base-100 dark:bg-base-100-dark">
        <p className="text-error dark:text-error-dark mb-2">
          {error.response?.status === 403
            ? `Forbidden: Email mismatch or unauthorized access (Email: ${currentUser?.email})`
            : error.response?.status === 401
            ? "Session expired. Please log in again."
            : error.response?.data?.message || "Error loading requested meals."}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries(["requested-meals", currentUser?.email?.toLowerCase(), page])}
          className="btn btn-sm bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label="Retry loading requested meals"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 dark:bg-base-100-dark">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary dark:text-primary-dark">
        Your Requested Meals
      </h2>
      {meals.length === 0 ? (
        <div className="text-center text-base-content/70 dark:text-base-content-dark/80">
          <p>No meals requested yet.</p>
          <a href="/meals" className="text-primary dark:text-primary-dark hover:underline">
            Browse meals to request one
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4" role="list">
            {meals.map((meal) => (
              <div
                key={meal._id}
                className="bg-base-100 dark:bg-base-100-dark p-4 shadow rounded flex justify-between items-center text-base-content dark:text-base-content-dark"
                role="listitem"
              >
                <div>
                  <h3 className="text-lg font-semibold">{meal.mealTitle || "Meal"}</h3>
                  <p className="text-sm text-base-content/70 dark:text-base-content-dark/80">
                    {meal.mealDescription || "No description"}
                  </p>
                  <p className="text-sm text-base-content/70 dark:text-base-content-dark/80">
                    Status: {meal.status || "Unknown"}
                  </p>
                  <p className="text-sm text-base-content/70 dark:text-base-content-dark/80">
                    Requested:{" "}
                    {meal.requestedAt
                      ? format(new Date(meal.requestedAt), "MM/dd/yyyy HH:mm")
                      : "Unknown"}
                  </p>
                </div>
                <button
                  className="btn bg-error/20 dark:bg-error-dark/50 text-error dark:text-error-dark border border-error dark:border-error-dark hover:bg-error/30 dark:hover:bg-error-dark/60 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => deleteMutation.mutate(meal._id)}
                  aria-label={`Delete request for ${meal.mealTitle || "meal"}`}
                  disabled={authLoading || deleteMutation.isLoading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <button
                className="btn btn-sm bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="mx-2 self-center text-base-content dark:text-base-content-dark">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequestedMeals;