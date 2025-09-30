import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const ManageBookings = () => {
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  
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

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      console.log("Fetching all bookings");
      const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Bookings response:", res.data);
      return res.data;
    },
    enabled: !!token && isAdmin,
    retry: 2,
  });

  if (isLoadingAdmin) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">Please log in to manage bookings.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">Access denied: Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error("Bookings fetch error:", error);
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">
          {error.response?.status === 403
            ? "Access denied: Admin privileges required."
            : error.response?.data?.message || "Error loading bookings."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center text-primary">
        All Stripe Bookings
      </h2>

      <div className="bg-base-100 rounded-xl shadow-xl p-6">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200 text-primary">
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Meal</th>
                <th>Price</th>
                <th>Status</th>
                
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-base-content/70">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => (
                  <tr key={b._id} className="hover:bg-base-200 transition">
                    <td>{idx + 1}</td>
                    <td className="text-base-content">{b.userName || "Unknown User"}</td>
                    <td className="text-base-content">{b.userEmail || "N/A"}</td>
                    <td className="text-base-content">{b.mealTitle || "Unknown Meal"}</td>
                    <td className="text-primary font-semibold">${b.price ? b.price.toFixed(2) : "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === "paid"
                            ? "bg-primary text-white"
                            : b.status === "pending"
                            ? "bg-secondary text-white"
                            : "bg-base-content text-white"
                        }`}
                      >
                        {b.status || "Pending"}
                      </span>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;