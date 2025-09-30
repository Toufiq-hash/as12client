import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

import MealCard from "../components/MealCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ThreeDButton from "../components/ThreeDButton";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const Meals = () => {
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [meals, setMeals] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchMeals = async ({ queryKey }) => {
    const [, category, priceRange, search, page] = queryKey;
    try {
      console.log("Fetching meals with params:", { category, priceRange, search, page });
      const res = await axios.get(`${API_BASE_URL}/meals`, {
        params: {
          category: category === "All" ? "" : category,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          search: search || undefined,
          page,
          limit: 6,
        },
      });
      console.log("API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching meals:", error.response || error);
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meals", category, priceRange, searchTerm, page],
    queryFn: fetchMeals,
    keepPreviousData: true,
    retry: 2,
  });

  useEffect(() => {
    console.log("useEffect triggered with data:", data);
    if (data?.meals) {
      setMeals((prev) => (page === 1 ? data.meals : [...prev, ...data.meals]));
      setHasMore(data.meals.length === 6 && page < data.totalPages);
    }
  }, [data, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search triggered with term:", searchTerm);
    setMeals([]);
    setPage(1);
    setHasMore(true);
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    setPriceRange(newRange);
    setPage(1);
    setMeals([]);
    setHasMore(true);
  };

  return (
    <div className="p-6 min-h-screen bg-base-100 dark:bg-base-100-dark">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-primary dark:text-primary-dark">
        All Meals
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10 justify-center items-center">
        <select
          className="select select-bordered border-2 border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-md hover:shadow-lg transition duration-300"
          value={category}
          onChange={(e) => {
            console.log("Category changed to:", e.target.value);
            setCategory(e.target.value);
            setPage(1);
            setMeals([]);
            setHasMore(true);
          }}
        >
          <option>All</option>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
        </select>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium text-base-content dark:text-base-content-dark">
                Min Price: ${priceRange[0]}
              </label>
              <input
                type="range"
                min={0}
                max={1000}
                value={priceRange[0]}
                className="range range-primary dark:range-primary-dark"
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-base-content dark:text-base-content-dark">
                Max Price: ${priceRange[1]}
              </label>
              <input
                type="range"
                min={0}
                max={1000}
                value={priceRange[1]}
                className="range range-primary dark:range-primary-dark"
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search meals..."
            className="input input-bordered border-2 border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark shadow-inner focus:outline-primary dark:focus:outline-primary-dark"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: "200px" }}
          />
          <ThreeDButton type="submit" className="flex items-center gap-2">
            
            Search
          </ThreeDButton>
        </form>
      </div>

      
      {isError && (
        <p className="text-center text-error dark:text-error-dark mt-10">
          Error loading meals: {error.message}
        </p>
      )}

      
      {isLoading && page === 1 ? (
        <LoadingSpinner />
      ) : (
        <InfiniteScroll
          dataLength={meals.length}
          next={() => {
            console.log("Fetching next page:", page + 1);
            setPage((prev) => prev + 1);
          }}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {!hasMore && meals.length === 0 && !isLoading && (
        <p className="text-center text-base-content/70 dark:text-base-content-dark/80 mt-10">
          No meals found.
        </p>
      )}
    </div>
  );
};

export default Meals;