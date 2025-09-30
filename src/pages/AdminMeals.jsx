import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const AdminMeals = () => {
  const { currentUser, token, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const limit = 10;
  const queryClient = useQueryClient();

  console.log("AuthContext in AdminMeals:", { currentUser, token, authLoading });

  const {
    data: { meals = [], totalPages = 1 } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-meals", sortBy, sortOrder, page],
    enabled: !!currentUser?.email && !!token && !authLoading,
    queryFn: async () => {
      const email = currentUser.email.toLowerCase();
      console.log("Fetching admin meals with params:", { sortBy, sortOrder, page, limit, email });
      const res = await axios.get(`${API_BASE_URL}/admin/meals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sortBy, sortOrder, page, limit },
      });
      console.log("Admin meals response:", {
        status: res.status,
        meals: res.data.meals.map((m) => ({ _id: m._id, title: m.title })),
        totalPages: res.data.totalPages,
      });
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
    mutationFn: (id) => {
      console.log(`Sending DELETE request for mealId: ${id}, user: ${currentUser?.email?.toLowerCase()}`);
      return axios.delete(`${API_BASE_URL}/meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(["admin-meals", sortBy, sortOrder, page]);
      const previousData = queryClient.getQueryData(["admin-meals", sortBy, sortOrder, page]);
      queryClient.setQueryData(["admin-meals", sortBy, sortOrder, page], (old) => ({
        ...old,
        meals: old?.meals?.filter((meal) => meal._id !== id) || [],
      }));
      return { previousData };
    },
    onError: (error, id, context) => {
      queryClient.setQueryData(["admin-meals", sortBy, sortOrder, page], context.previousData);
      console.error("Error deleting meal:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        mealId: id,
        userEmail: currentUser?.email,
      });
      toast.error(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : error.response?.status === 403
          ? "Forbidden: Admin access only."
          : error.response?.status === 404
          ? "Meal not found or already deleted."
          : error.response?.data?.message || "Failed to delete meal."
      );
    },
    onSuccess: (response, id) => {
      console.log(`Delete successful for mealId: ${id}`, response.data);
      toast.success("Meal deleted successfully");
    },
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1); 
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const validateMealId = (id) => {
    const isValid = /^[0-9a-fA-F]{24}$/.test(id);
    console.log("Validating mealId:", { id, isValid });
    return isValid;
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          All Meals (Admin)
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="bg-base-100 p-4 shadow rounded">
              <div className="h-4 bg-base-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-base-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Admin meals fetch error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      email: currentUser?.email,
    });
    return (
      <div className="text-center p-6">
        <p className="text-error mb-2">
          {error.response?.status === 403
            ? error.response?.data?.message || "Forbidden: Admin access only."
            : error.response?.status === 401
            ? "Session expired. Please log in again."
            : error.response?.data?.message || "Error loading meals."}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries(["admin-meals", sortBy, sortOrder, page])}
          className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-white"
          aria-label="Retry loading meals"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        All Meals (Admin)
      </h2>
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => handleSort("likes")}
          className={`btn btn-sm ${sortBy === "likes" ? "btn-primary text-white hover:bg-primary/90" : "btn-ghost border-base-300 text-base-content hover:bg-base-200"}`}
          aria-label={`Sort by likes ${sortBy === "likes" && sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          Sort by Likes {sortBy === "likes" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("reviews_count")}
          className={`btn btn-sm ${sortBy === "reviews_count" ? "btn-primary text-white hover:bg-primary/90" : "btn-ghost border-base-300 text-base-content hover:bg-base-200"}`}
          aria-label={`Sort by reviews count ${sortBy === "reviews_count" && sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          Sort by Reviews {sortBy === "reviews_count" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>
      {meals.length === 0 ? (
        <div className="text-center text-base-content/50">
          <p>No meals found.</p>
          <Link to="/admin/meals/add" className="text-primary hover:underline">
            Add a new meal
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full bg-base-100">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Likes</th>
                  <th>Reviews</th>
                  <th>Rating</th>
                  <th>Distributor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal) => (
                  <tr key={meal._id} className="hover">
                    <td>{meal.title || "Untitled"}</td>
                    <td>{meal.likes || 0}</td>
                    <td>{meal.reviews_count || 0}</td>
                    <td>{meal.rating ? meal.rating.toFixed(1) : "N/A"}</td>
                    <td>{meal.distributorName || "Unknown"}</td>
                    <td className="space-x-2">
                      <Link
                        to={`/admin/meals/update/${meal._id}`}
                        className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-white"
                        aria-label={`Update ${meal.title}`}
                      >
                        Update
                      </Link>
                      <button
                        className="btn btn-sm bg-error text-white hover:bg-error/90"
                        onClick={() => deleteMutation.mutate(meal._id)}
                        aria-label={`Delete ${meal.title}`}
                        disabled={authLoading || deleteMutation.isLoading}
                      >
                        Delete
                      </button>
                      <Link
                        to={validateMealId(meal._id) ? `/meal/${meal._id}` : "#"}
                        onClick={() => {
                          if (!validateMealId(meal._id)) {
                            console.warn("Invalid mealId for View link:", { id: meal._id, title: meal.title });
                            toast.error("Invalid meal ID. Cannot view meal.");
                          }
                        }}
                        className={`btn btn-sm btn-outline border-secondary text-secondary hover:bg-secondary hover:text-white ${
                          !validateMealId(meal._id) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        aria-label={`View ${meal.title}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <button
                className="btn btn-sm btn-primary text-white mr-2 hover:bg-primary/90"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="mx-2 self-center text-base-content">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm btn-primary text-white ml-2 hover:bg-primary/90"
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

export default AdminMeals;