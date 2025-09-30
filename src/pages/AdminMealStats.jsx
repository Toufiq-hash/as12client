import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const AdminMealStats = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const token = localStorage.getItem("access-token");

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user profile for admin check", { token: token ? "Present" : "Missing" });
        const res = await axios.get(`${API_BASE_URL}/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User profile response:", { email: res.data.email, role: res.data.role });
        setIsAdmin(res.data?.role === "admin");
      } catch (err) {
        console.error("Error fetching user profile:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        });
        toast.error("Failed to verify admin status.");
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    if (token) fetchUser();
    else {
      console.warn("No token found for admin check");
      setIsLoadingAdmin(false);
    }
  }, [token]);

  const {
    data: stats = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meal-stats"],
    queryFn: async () => {
      console.log("Fetching meal stats", { token: token ? "Present" : "Missing" });
      const res = await axios.get(`${API_BASE_URL}/meals/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Meal stats response:", {
        status: res.status,
        count: res.data.length,
        titles: res.data.map((item) => item.title),
        ids: res.data.map((item) => item._id),
      });
      return res.data;
    },
    enabled: !!token && isAdmin,
    retry: 2,
  });

  if (isLoadingAdmin) return <LoadingSpinner />;

  if (!token) {
    console.warn("No token available for meal stats");
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">Please log in to view meal stats.</p>
      </div>
    );
  }

  if (!isAdmin) {
    console.warn("User is not admin", { isAdmin });
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">Access denied: Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    console.error("Meal stats fetch error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.message,
    });
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-error">
          {error.response?.status === 403
            ? "Access denied: Admin privileges required."
            : error.response?.data?.message?.includes("BSONError") ||
              error.response?.data?.message === "Invalid meal ID"
            ? "Invalid meal ID detected in database. Please clean up reviews data."
            : error.response?.data?.message || "Failed to load stats."}
        </p>
        <button
          onClick={() => refetch()}
          className="ml-4 btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Array.isArray(stats) || stats.length === 0) {
    console.warn("No stats data available", { stats });
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4 text-center">
        <p className="text-primary">No stats data available.</p>
      </div>
    );
  }

  // Chart data
  const barData = {
    labels: stats.map((item) => item.title),
    datasets: [
      {
        label: "Likes",
        data: stats.map((item) => item.likes || 0),
        backgroundColor: "#2563EB", 
        borderColor: "#1E40AF", 
        borderWidth: 1,
        borderRadius: 10,
      },
    ],
  };

  const lineData = {
    labels: stats.map((item) => item.title),
    datasets: [
      {
        label: "Review Count",
        data: stats.map((item) => item.reviewCount || 0),
        borderColor: "#F97316", 
        backgroundColor: "#F97316", 
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#C2410C", 
        pointBorderColor: "#C2410C", 
        pointBorderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-primary">
        Meal Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h3 className="text-2xl font-semibold mb-6 text-center text-primary">
            Meal Popularity (Likes)
          </h3>
          <Bar data={barData} options={{ responsive: true }} />
        </div>

        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h3 className="text-2xl font-semibold mb-6 text-center text-primary">
            Review Growth
          </h3>
          <Line data={lineData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default AdminMealStats;