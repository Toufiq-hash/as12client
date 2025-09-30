import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";

const MyLikes = () => {
  const { currentUser, token, loading: authLoading } = useAuth();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; 

  const API_URL = "https://exp-v9z4.onrender.com";

  
  const fetchLikes = async (pageNum = 1) => {
    if (!currentUser?.email || !token) {
      toast.error("Please log in to view your likes.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/my-likes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email: currentUser.email, page: pageNum, limit },
      });
      setLikes(Array.isArray(res.data.meals) ? res.data.meals : []);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching likes:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      toast.error(
        err.response?.status === 401
          ? "Invalid token. Please log in again."
          : err.response?.data?.message || "Failed to load likes"
      );
    } finally {
      setLoading(false);
    }
  };

  
  const handleRemoveLike = async (id) => {
    if (!currentUser?.email || !token) {
      toast.error("Please log in to remove likes.");
      return;
    }

    const confirmDelete = window.confirm("Remove this meal from your likes?");
    if (!confirmDelete) return;

    const previousLikes = likes;
    setLikes((prev) => prev.filter((like) => like._id !== id));

    try {
      const res = await axios.patch(
        `${API_URL}/meals/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data?.success || res.data?.modifiedCount === 0) {
        setLikes(previousLikes);
        toast.error("Failed to remove like");
      } else {
        toast.success("Like removed");
      }
    } catch (err) {
      setLikes(previousLikes);
      console.error("Error removing like:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        mealId: id,
      });
      toast.error(
        err.response?.status === 401
          ? "Invalid token. Please log in again."
          : err.response?.status === 404
          ? "Meal not found."
          : err.response?.data?.message || "Failed to remove like"
      );
    }
  };

  
  useEffect(() => {
    if (authLoading) return;
    if (currentUser?.email && token) {
      fetchLikes(page);
    } else {
      setLoading(false);
    }
  }, [currentUser, token, authLoading, page]);

  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchLikes(newPage);
    }
  };

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="p-6 min-h-screen bg-base-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary">
          My Liked Meals
        </h2>
        <div className="animate-pulse overflow-x-auto">
          <div className="h-4 bg-base-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-base-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-base-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-base-100">
      <h2 className="text-3xl font-bold text-center mb-6 text-primary">
        My Liked Meals
      </h2>

      {likes.length === 0 ? (
        <p className="text-center text-base-content/70">
          You haven't liked any meals yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full border border-base-300" role="grid">
              <thead className="bg-base-200 text-base-content font-semibold">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Meal</th>
                  <th scope="col">Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {likes.map((like, idx) => (
                  <motion.tr
                    key={like._id}
                    role="row"
                    className="text-base-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td>{like.title || "Unnamed Meal"}</td>
                    <td>
                      {format(
                        new Date(like.postTime || Date.now()),
                        "MM/dd/yyyy"
                      )}
                    </td>
                    <td>
                      <motion.button
                        className="btn btn-ghost btn-sm text-error hover:bg-error/20 transition-all duration-300"
                        onClick={() => handleRemoveLike(like._id)}
                        aria-label={`Remove like for ${like.title || "Unnamed Meal"}`}
                        disabled={authLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <motion.button
                className="btn btn-ghost btn-sm text-primary hover:bg-primary/20 transition-all duration-300"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <span className="mx-2 self-center text-base-content">
                Page {page} of {totalPages}
              </span>
              <motion.button
                className="btn btn-ghost btn-sm text-primary hover:bg-primary/20 transition-all duration-300"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyLikes;