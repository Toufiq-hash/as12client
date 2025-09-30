import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

const PublishUpcoming = () => {
  const { currentUser, token, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photoUrl: "",
    postTime: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !token) {
      toast.error("Please login to add meals.");
      navigate("/login");
      return;
    }
    if (role !== "admin") {
      toast.error("Only admins can add upcoming meals.");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://exp-v9z4.onrender.com/upcoming-meals",
        {
          ...formData,
          postTime: new Date(formData.postTime).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Upcoming meal added successfully!");
        setFormData({ title: "", description: "", photoUrl: "", postTime: "" });
      }
    } catch (err) {
      console.error("Error adding upcoming meal:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      const message = err.response?.data?.message || "Failed to add meal.";
      toast.error(message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("access-token");
        localStorage.removeItem("user-role");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 dark:bg-base-100-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-base-100 dark:bg-base-100-dark shadow-xl rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold mb-4 text-primary dark:text-primary-dark">Add Upcoming Meal</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content dark:text-base-content-dark">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-inner focus:outline-primary dark:focus:outline-primary-dark"
              placeholder="Enter meal title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content dark:text-base-content-dark">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-inner focus:outline-primary dark:focus:outline-primary-dark"
              placeholder="Enter meal description"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content dark:text-base-content-dark">Photo URL</label>
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              className="input input-bordered w-full border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-inner focus:outline-primary dark:focus:outline-primary-dark"
              placeholder="Enter photo URL"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content dark:text-base-content-dark">Post Time</label>
            <input
              type="datetime-local"
              name="postTime"
              value={formData.postTime}
              onChange={handleChange}
              className="input input-bordered w-full border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-inner focus:outline-primary dark:focus:outline-primary-dark"
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-full bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
            disabled={loading || authLoading || role !== "admin"}
          >
            {loading ? "Adding..." : "Add Upcoming Meal"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PublishUpcoming;