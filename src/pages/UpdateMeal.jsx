import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const UpdateMeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [meal, setMeal] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    ingredients: [],
    distributorName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const response = await axios.get(`https://exp-v9z4.onrender.com/meals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeal({
          title: response.data.title || "",
          category: response.data.category || "",
          price: response.data.price || "",
          description: response.data.description || "",
          ingredients: response.data.ingredients || [],
          distributorName: response.data.distributorName || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch meal details");
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeal((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientsChange = (e) => {
    const ingredients = e.target.value.split(",").map((item) => item.trim());
    setMeal((prev) => ({ ...prev, ingredients }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.patch(`https://exp-v9z4.onrender.com/meals/${id}`, meal, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/meals");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update meal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Meal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Meal Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={meal.title}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={meal.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={meal.price}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={meal.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
            Ingredients (comma-separated)
          </label>
          <input
            type="text"
            id="ingredients"
            name="ingredients"
            value={meal.ingredients.join(", ")}
            onChange={handleIngredientsChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="distributorName" className="block text-sm font-medium text-gray-700">
            Distributor Name
          </label>
          <input
            type="text"
            id="distributorName"
            name="distributorName"
            value={meal.distributorName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Updating..." : "Update Meal"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/meals")}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMeal;