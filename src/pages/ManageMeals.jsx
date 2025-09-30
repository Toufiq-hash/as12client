import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ManageMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/admin/meals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sortBy, sortOrder, page, limit },
      });
      setMeals(res.data.meals || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching meals:", err);
      toast.error(
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 403
          ? "Forbidden: Admin access only."
          : "Failed to fetch meals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [sortBy, sortOrder, page]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this meal?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${API_BASE_URL}/meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Meal deleted!");
      setMeals((prev) => prev.filter((meal) => meal._id !== id));
    } catch (err) {
      console.error("Error deleting meal:", err);
      toast.error(
        err.response?.status === 404
          ? "Meal not found or already deleted."
          : err.response?.status === 403
          ? "Forbidden: Admin access only."
          : "Failed to delete meal."
      );
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center text-primary">Manage Meals</h2>

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

      <div className="rounded-xl">
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl p-6">
          {loading ? (
            <div className="text-center text-lg text-primary">Loading...</div>
          ) : meals.length === 0 ? (
            <div className="text-center text-primary">
              <p>No meals found.</p>
              <Link to="/admin/add-meal" className="text-primary hover:underline">
                Add a new meal
              </Link>
            </div>
          ) : (
            <>
              <table className="table table-zebra w-full text-base-content">
                <thead>
                  <tr className="bg-base-200 text-primary">
                    <th>#</th>
                    <th>Title</th>
                    <th>Likes</th>
                    <th>Reviews</th>
                    <th>Rating</th>
                    <th>Distributor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal, index) => (
                    <tr key={meal._id} className="hover:bg-base-200 transition">
                      <td>{index + 1}</td>
                      <td>{meal.title || "Untitled"}</td>
                      <td>{meal.likes || 0}</td>
                      <td>{meal.reviews_count || 0}</td>
                      <td>{meal.rating ? meal.rating.toFixed(1) : "N/A"}</td>
                      <td>{meal.distributorName || "Unknown"}</td>
                      <td className="space-x-2">
                        <Link
                          to={`/admin/meals/update/${meal._id}`}
                          className="btn btn-xs btn-outline border-primary text-primary hover:bg-primary hover:text-white"
                          title="Update Meal"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(meal._id)}
                          className="btn btn-xs bg-error text-white hover:bg-error/90"
                          title="Delete Meal"
                        >
                          <FaTrash />
                        </button>
                        <Link
                          to={`/meal/${meal._id}`}
                          className="btn btn-xs btn-outline border-secondary text-secondary hover:bg-secondary hover:text-white"
                          title="View Meal"
                        >
                          <FaEye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>
    </div>
  );
};

export default ManageMeals;