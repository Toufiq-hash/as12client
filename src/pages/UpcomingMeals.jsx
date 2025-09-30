import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const UpcomingMeals = () => {
  const { currentUser, token } = useAuth();

  const { data: meals = [], isLoading, error, refetch } = useQuery({
    queryKey: ["upcoming-meals"],
    queryFn: async () => {
      const res = await axios.get("https://exp-v9z4.onrender.com/upcoming-meals", {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });
      console.log("Upcoming meals fetched:", {
        status: res.status,
        count: res.data.length,
        mealIds: res.data.map((m) => m._id),
      });
      return res.data;
    },
  });

  const isPremium = currentUser?.badge && ["Silver", "Gold", "Platinum"].includes(currentUser.badge);

  const handleLike = async (mealId) => {
    if (!currentUser?.email) {
      console.warn("Like attempt failed: No user logged in");
      toast.error("Please login to like meals.");
      return;
    }
    if (!isPremium) {
      console.warn("Like attempt failed: User is not premium", {
        email: currentUser.email,
        badge: currentUser.badge || "None",
      });
      toast.error("Only premium users (Silver, Gold, Platinum) can like upcoming meals.");
      return;
    }
    if (!token) {
      console.warn("Like attempt failed: No token available", {
        email: currentUser.email,
        localStorageToken: localStorage.getItem("token") ? "Present" : "Missing",
      });
      toast.error("Authentication error: No token found.");
      return;
    }

    try {
      console.log(`Attempting to like meal ${mealId} for user ${currentUser.email}`);
      const res = await axios.patch(
        `https://exp-v9z4.onrender.com/upcoming-meals/like/${mealId}`,
        { userEmail: currentUser.email.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Like response:", {
        status: res.status,
        data: res.data,
        mealId,
        userEmail: currentUser.email,
      });

      if (res.data.success && res.data.modifiedCount > 0) {
        toast.success("Meal liked!");
        refetch();
      } else {
        toast.error(res.data.message || "You already liked this meal.");
      }
    } catch (err) {
      console.error("Error liking meal:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        mealId,
        userEmail: currentUser.email,
      });
      toast.error(err.response?.data?.message || "Error liking the meal.");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        Failed to load upcoming meals: {error.message}
      </p>
    );

  if (meals.length === 0)
    return (
      <p className="text-center mt-10 text-gray-500 font-semibold">
        No upcoming meals found.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Upcoming Meals
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <motion.div
            key={meal._id}
            className="card bg-white shadow-xl border border-base-300 text-indigo-700"
            whileHover={{ scale: 1.02 }}
          >
            <figure>
              <img
                src={meal.photoUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={meal.title || "Upcoming meal"}
                className="h-52 w-full object-cover rounded-t-lg"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{meal.title || "Untitled Meal"}</h2>
              <p>
                {meal.description?.slice(0, 80) || "No description available"}
                {meal.description?.length > 80 ? "..." : ""}
              </p>
              <p className="text-sm">Post Time: {new Date(meal.postTime).toLocaleDateString()}</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm font-medium">Likes: {meal.likedBy?.length || 0}</p>
                <button
                  onClick={() => handleLike(meal._id)}
                  disabled={!currentUser?.email || !isPremium}
                  className={`btn btn-sm btn-outline btn-secondary ${
                    !currentUser?.email || !isPremium ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={
                    !currentUser?.email
                      ? "Login to like meals"
                      : !isPremium
                      ? "Only premium users can like upcoming meals"
                      : "Like this meal"
                  }
                >
                  ❤️ Like
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMeals;
