import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const AddMeal = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const queryClient = useQueryClient();
  const { currentUser, token, loading: authLoading, refetchUser, logout } = useAuth();
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    console.log("AuthContext values:", { currentUser, token, authLoading });
    if (!authLoading && !token) {
      setAuthError("No authentication token found. Please log in again.");
      toast.error("Please log in to add meals.");
    } else if (!authLoading && !currentUser) {
      setAuthError("No user data found. Please log in again.");
      toast.error("Please log in to add meals.");
    } else if (!authLoading && !isAdmin) {
      setAuthError(`User role "${currentUser?.role || "none"}" is not admin.`);
      toast.error("Only admins can add meals.");
    } else {
      setAuthError(null);
    }
  }, [authLoading, isAdmin, token, currentUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onSubmit = async (data) => {
    try {
      if (!token) {
        console.log("Add meal attempt failed: No token found");
        throw new Error("Unauthorized: Please log in again.");
      }
      if (!isAdmin) {
        console.log("Add meal attempt failed: User is not admin", { currentUser });
        throw new Error("Only admins can add meals.");
      }

      
      data.price = parseFloat(data.price);
      data.ingredients = data.ingredients
        ? data.ingredients.split(",").map((item) => item.trim())
        : [];
      data.postTime = new Date(data.date);

      console.log("Submitting meal:", data);

      const res = await axios.post(`${API_BASE_URL}/meals`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Meal added successfully:", res.data);
      toast.success("Meal added successfully!");
      reset();
      queryClient.invalidateQueries(["meals"]);
    } catch (err) {
      console.error("Error adding meal:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        userEmail: currentUser?.email,
      });
      const message =
        err.response?.status === 401
          ? "Invalid or expired token. Please log in again."
          : err.response?.status === 403
          ? "Only admins can add meals."
          : err.response?.status === 400
          ? err.response?.data?.message || "Invalid meal data."
          : err.message || "Failed to add meal.";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-base-100 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-primary">
        Add a New Meal
      </h2>
      {authLoading ? (
        <p className="text-center text-primary">Loading authentication...</p>
      ) : authError ? (
        <div className="text-center">
          <p className="text-error mb-4">{authError}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => refetchUser()}
              className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-white"
              aria-label="Retry authentication"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline border-error text-error hover:bg-error hover:text-white"
              aria-label="Log out"
            >
              Log Out
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <input
              type="text"
              placeholder="Meal Title"
              className={`input w-full border-base-300 ${errors.title ? "border-error" : ""}`}
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-error text-sm">{errors.title.message}</p>}
          </div>

          
          <div>
            <textarea
              placeholder="Description"
              className={`textarea w-full border-base-300 ${errors.description ? "border-error" : ""}`}
              rows={4}
              {...register("description", { required: "Description is required" })}
            ></textarea>
            {errors.description && (
              <p className="text-error text-sm">{errors.description.message}</p>
            )}
          </div>

          
          <div>
            <input
              type="text"
              placeholder="Ingredients (comma-separated, e.g., pasta, sauce)"
              className={`input w-full border-base-300 ${errors.ingredients ? "border-error" : ""}`}
              {...register("ingredients", { required: "Ingredients are required" })}
            />
            {errors.ingredients && (
              <p className="text-error text-sm">{errors.ingredients.message}</p>
            )}
          </div>

          
          <div>
            <input
              type="date"
              className={`input w-full border-base-300 ${errors.date ? "border-error" : ""}`}
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && <p className="text-error text-sm">{errors.date.message}</p>}
          </div>

          
          <div>
            <input
              type="url"
              placeholder="Photo URL"
              className={`input w-full border-base-300 ${errors.photoUrl ? "border-error" : ""}`}
              {...register("photoUrl", { required: "Photo URL is required" })}
            />
            {errors.photoUrl && (
              <p className="text-error text-sm">{errors.photoUrl.message}</p>
            )}
          </div>

          
          <div>
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              className={`input w-full border-base-300 ${errors.price ? "border-error" : ""}`}
              {...register("price", {
                required: "Price is required",
                min: { value: 0.01, message: "Price must be positive" },
              })}
            />
            {errors.price && <p className="text-error text-sm">{errors.price.message}</p>}
          </div>

          
          <div>
            <select
              className={`select w-full border-base-300 ${errors.category ? "border-error" : ""}`}
              defaultValue=""
              {...register("category", { required: "Category is required" })}
            >
              <option value="" disabled>
                Select Meal Category
              </option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
            {errors.category && (
              <p className="text-error text-sm">{errors.category.message}</p>
            )}
          </div>

          
          <button
            type="submit"
            className="btn btn-primary text-white w-full hover:bg-primary/90"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? "Adding..." : "Add Meal"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddMeal;