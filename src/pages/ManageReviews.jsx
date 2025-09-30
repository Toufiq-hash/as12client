import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ManageReviews = () => {
  const token = localStorage.getItem("access-token");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/my-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAdmin(res.data?.role === "admin");
      } catch (err) {
        console.error("Error fetching user profile:", err);
        toast.error("Failed to verify admin status.");
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    if (token) {
      fetchUser();
    } else {
      setIsLoadingAdmin(false);
    }
  }, [token]);

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      console.log("Fetching all reviews");
      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Reviews response:", res.data);
      return res.data;
    },
    enabled: !!token && isAdmin,
    retry: 2,
  });

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      console.log("Deleting review with ID:", reviewToDelete._id);
      const res = await axios.delete(`${API_BASE_URL}/reviews/${reviewToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.deletedCount > 0) {
        toast.success("Review deleted successfully!");
        refetch();
      } else {
        toast.error("Review not found.");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setShowModal(false);
      setReviewToDelete(null);
    }
  };

  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setReviewToDelete(null);
  };

  if (isLoadingAdmin) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 text-center">
        <p className="text-error dark:text-error-dark">Please log in to manage reviews.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 text-center">
        <p className="text-error dark:text-error-dark">Access denied: Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error("Reviews fetch error:", error);
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6 text-center">
        <p className="text-error dark:text-error-dark">
          {error.response?.status === 403
            ? "Access denied: Admin privileges required."
            : error.response?.data?.message || "Error loading reviews."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-base-100 dark:bg-base-100-dark p-6 rounded-xl shadow text-base-content dark:text-base-content-dark">
      <h2 className="text-2xl font-bold mb-6 text-primary dark:text-primary-dark">Manage Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-base-content dark:text-base-content-dark">No reviews yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200 dark:bg-base-200-dark text-primary dark:text-primary-dark">
                <th>Meal</th>
                <th>User</th>
                <th>Review</th>
                <th>Likes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-base-200 dark:hover:bg-base-200-dark">
                  <td className="text-base-content dark:text-base-content-dark">{review.mealTitle || "Unknown Meal"}</td>
                  <td className="text-base-content dark:text-base-content-dark">{review.userEmail || "Unknown User"}</td>
                  <td className="text-base-content dark:text-base-content-dark">{review.comment || "No comment"}</td>
                  <td className="text-base-content dark:text-base-content-dark">{review.likes || 0}</td>
                  <td>
                    <button
                      onClick={() => openDeleteModal(review)}
                      className="btn btn-sm bg-error dark:bg-error-dark text-white hover:bg-error/90 dark:hover:bg-error-dark/90"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 dark:bg-base-200-dark p-6 rounded-lg shadow-xl max-w-md w-full border border-base-300 dark:border-base-100-dark">
            <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-4">
              Confirm Deletion
            </h3>
            <p className="text-base-content dark:text-base-content-dark mb-6">
              Are you sure you want to delete the review for{" "}
              <span className="font-semibold">{reviewToDelete?.mealTitle || "Unknown Meal"}</span> by{" "}
              <span className="font-semibold">{reviewToDelete?.userEmail || "Unknown User"}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="btn btn-sm bg-base-200 dark:bg-base-200-dark text-base-content dark:text-base-content-dark hover:bg-base-300 dark:hover:bg-base-300-dark border border-base-300 dark:border-base-100-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-sm bg-error dark:bg-error-dark text-white hover:bg-error/80 dark:hover:bg-error-dark/80 border border-error dark:border-error-dark"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;