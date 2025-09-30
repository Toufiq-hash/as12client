import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import Banner from "../components/Banner";
import ExtraSection1 from "../components/ExtraSection1";
import ExtraSection2 from "../components/ExtraSection2";
import MembershipCard from "../components/MembershipCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const Home = () => {
  const packages = [
    { name: "Silver", price: 9.99 },
    { name: "Gold", price: 14.99 },
    { name: "Platinum", price: 19.99 },
  ];

  
  const [activeTab, setActiveTab] = useState("All");

  
  const fetchMealsByCategory = async ({ queryKey }) => {
    const [, category] = queryKey;
    console.log(`Fetching meals for category: ${category}`);
    try {
      const res = await axios.get(`${API_BASE_URL}/meals`, {
        params: {
          category: category === "All" ? "" : category,
          limit: 3, 
          page: 1,
        },
      });
      console.log("Meals API response:", res.data);
      return res.data.meals || [];
    } catch (error) {
      console.error("Error fetching meals:", error.response || error);
      throw error;
    }
  };

  const { data: meals = [], isLoading: mealsLoading, isError, error } = useQuery({
    queryKey: ["mealsByCategory", activeTab],
    queryFn: fetchMealsByCategory,
    keepPreviousData: true,
    retry: 2,
  });

  return (
    <div className="bg-base-100 dark:bg-base-100-dark">
      <Banner />
      <section className="py-16 px-6 max-w-screen-xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 text-primary dark:text-primary-dark">
          Choose Your Membership
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="w-full sm:w-72"
            >
              <MembershipCard name={pkg.name} price={pkg.price} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meals by Category Tab System */}
      <section className="py-16 px-6 max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-primary dark:text-primary-dark">
          Meals by Category
        </h2>
        <div className="flex justify-center gap-4 mb-8">
          {["All", "Breakfast", "Lunch", "Dinner"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn btn-md px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary text-white dark:bg-primary-dark dark:text-white hover:bg-primary/80"
                  : "bg-base-200 text-primary dark:bg-base-200-dark dark:text-primary-dark hover:bg-base-300"
              }`}
              aria-label={`Show ${tab} meals`}
            >
              {tab}
            </button>
          ))}
        </div>

        {mealsLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <p className="text-center text-error dark:text-error-dark">
            Error loading meals: {error?.response?.data?.message || error.message}
          </p>
        ) : meals.length === 0 ? (
          <p className="text-center text-base-content/70 dark:text-base-content-dark/80">
            No meals found in this category.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div
                key={meal._id}
                className="card bg-base-100 dark:bg-base-200-dark shadow-xl border border-base-300 dark:border-base-100-dark rounded-lg overflow-hidden"
              >
                <figure className="h-48">
                  <img
                    src={meal.photoUrl || "/fallback-image.jpg"}
                    alt={meal.title || "Meal Image"}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-lg font-semibold text-base-content dark:text-base-content-dark">
                    {meal.title || "Untitled Meal"}
                  </h3>
                  <p className="text-secondary dark:text-secondary-dark">
                    ⭐ {meal.rating?.toFixed(1) || 0} ({meal.reviews_count || 0} reviews)
                  </p>
                  <p className="text-lg font-bold text-primary dark:text-primary-dark">
                    ${meal.price?.toFixed(2) || "N/A"}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <Link to={`/meal/${meal._id}`}>
                      <button
                        className="btn btn-primary dark:bg-primary-dark dark:border-primary-dark text-white hover:bg-primary/80 dark:hover:bg-primary-dark/80"
                        aria-label={`View details for ${meal.title}`}
                      >
                        Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-base-100 py-16 px-6 max-w-screen-xl mx-auto">
        <ExtraSection1 />
        <ExtraSection2 />
      </section>
    </div>
  );
};

export default Home;