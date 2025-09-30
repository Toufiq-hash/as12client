import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ServeMeals = () => {
  const { currentUser, token, loading: authLoading } = useAuth();
  const [serving, setServing] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  
  const {
    data: { meals = [], total = 0, page = 1, limit = 10, totalPages = 1 } = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["unservedMeals", currentUser?.email, currentPage],
    queryFn: async () => {
      if (!currentUser?.email || !token) {
        console.log("Skipping fetch: Missing email or token", {
          currentUser: currentUser?.email,
          token,
        });
        return { meals: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
      console.log("Fetching unserved meals for admin:", currentUser.email, `Page: ${currentPage}`);
      const res = await axios.get(`${API_BASE_URL}/meals/unserved?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Unserved meals response:", res.data);
      return res.data;
    },
    enabled: !!currentUser?.email && !!token && !authLoading,
    retry: (failureCount, error) => {
      if (error.response?.status === 400 && failureCount < 3) {
        console.log(`Retrying fetch after 400 error (attempt ${failureCount + 1}/3)`);
        return true;
      }
      return false;
    },
    retryDelay: 1000,
    staleTime: 1000 * 60,
  });

  
  const handleServe = async (orderId) => {
    if (!currentUser || !token) {
      console.log("Serve attempt failed: User not logged in or token missing", {
        currentUser: currentUser?.email,
        token,
      });
      toast.error("Please log in to serve meals.");
      return;
    }

    setServing((prev) => ({ ...prev, [orderId]: true }));
    try {
      console.log("Serving order:", { orderId, userEmail: currentUser.email });
      const res = await axios.patch(
        `${API_BASE_URL}/meals/serve/${orderId}`,
        { status: "delivered" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success || res.data?.modifiedCount > 0) {
        console.log("Order served successfully:", res.data);
        toast.success("Meal served and marked as delivered!");
        refetch();
      } else {
        console.log("Serve failed: No changes made", res.data);
        toast.error(res.data?.message || "Failed to serve meal.");
      }
    } catch (err) {
      console.error("Error serving meal:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        orderId,
        userEmail: currentUser.email,
      });
      const message =
        err.response?.status === 400
          ? err.response?.data?.message || "Invalid order ID or meal ID."
          : err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 403
          ? "Only admins can serve meals."
          : err.response?.status === 404
          ? "Order not found."
          : err.response?.data?.message || "Could not serve meal.";
      toast.error(message);
    } finally {
      setServing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1) {
          pages.push(i);
        }
      }
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      if (totalPages !== 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error("Error fetching unserved meals:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      details: error.response?.data,
      response: error.response,
    });
    return (
      <div className="text-center p-6 bg-base-100 dark:bg-base-100-dark">
        <p className="text-error dark:text-error-dark mb-4">
          {error.response?.status === 400
            ? "Invalid data in orders detected. Retrying may resolve this, or contact support."
            : error.response?.status === 403
            ? "Only admins can view unserved meals."
            : error.response?.data?.message || "Error loading unserved meals."}
        </p>
        <button
          onClick={() => refetch()}
          className="btn bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label="Retry loading unserved meals"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 dark:bg-base-100-dark rounded-3xl shadow-xl">
      <h2 className="text-3xl font-extrabold text-primary dark:text-primary-dark mb-6">Unserved Meals</h2>
      {meals.length === 0 ? (
        <p className="text-primary dark:text-primary-dark text-center">No unserved meals found.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {meals.map((order) => (
              <div
                key={order._id}
                className="p-4 bg-base-100 dark:bg-base-100-dark rounded-lg shadow-md border border-base-300 dark:border-base-100-dark"
                aria-labelledby={`order-${order._id}`}
              >
                <h3 id={`order-${order._id}`} className="text-lg font-semibold text-primary dark:text-primary-dark">
                  {order.mealTitle}
                </h3>
                <p className="text-base-content/70 dark:text-base-content-dark/80">
                  Requested by: {order.userName} ({order.userEmail})
                </p>
                <p className="text-base-content/70 dark:text-base-content-dark/80">
                  Status: <span className="font-medium">{order.status}</span>
                </p>
                <p className="text-base-content/70 dark:text-base-content-dark/80">
                  Price: ${order.price?.toFixed(2)}
                </p>
                <button
                  onClick={() => handleServe(order._id)}
                  className={`btn mt-2 ${
                    serving[order._id] || order.status === "delivered"
                      ? "bg-base-300 dark:bg-base-300-dark text-base-content/50 dark:text-base-content-dark/50 cursor-not-allowed"
                      : "bg-secondary/20 dark:bg-secondary-dark/60 text-secondary dark:text-secondary-dark border border-secondary dark:border-secondary-dark hover:bg-secondary/30 dark:hover:bg-secondary-dark/70 shadow-sm hover:shadow-md"
                  } transition-all duration-200`}
                  disabled={serving[order._id] || order.status === "delivered"}
                  aria-label={`Serve order ${order.mealTitle}`}
                >
                  {serving[order._id] ? "Serving..." : "Serve"}
                </button>
              </div>
            ))}
          </div>

          
          {total > limit && (
            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center space-x-1 mb-4">
                <p className="text-sm text-base-content dark:text-base-content-dark">
                  Page {currentPage} of {totalPages} • Showing {meals.length} of {total} orders
                </p>
              </div>

              <div className="flex items-center space-x-2">
                
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-base-300 dark:bg-base-300-dark text-base-content/50 dark:text-base-content-dark/50 cursor-not-allowed"
                      : "bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 border border-primary dark:border-primary-dark"
                  }`}
                  aria-label="Previous page"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                    disabled={pageNum === '...'}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pageNum === '...'
                        ? "text-base-content/50 dark:text-base-content-dark/50 cursor-default"
                        : currentPage === pageNum
                        ? "bg-primary dark:bg-primary-dark text-base-content-dark dark:text-base-content shadow-md"
                        : "bg-base-100 dark:bg-base-100-dark text-base-content dark:text-base-content-dark hover:bg-base-200 dark:hover:bg-base-200-dark border border-base-300 dark:border-base-100-dark"
                    }`}
                    aria-label={typeof pageNum === 'number' ? `Go to page ${pageNum}` : undefined}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-base-300 dark:bg-base-300-dark text-base-content/50 dark:text-base-content-dark/50 cursor-not-allowed"
                      : "bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 border border-primary dark:border-primary-dark"
                  }`}
                  aria-label="Next page"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServeMeals;