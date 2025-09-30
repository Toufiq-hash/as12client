import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminStats = () => {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/meal-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      return [
        { label: "Meals", value: res.data.totalMeals },
        { label: "Orders", value: res.data.totalOrders },
        { label: "Users", value: res.data.totalUsers },
        { label: "Reviews", value: res.data.totalReviews },
      ];
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="text-center py-10 text-error font-semibold">
        Failed to load stats.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-base-100 rounded-xl shadow-lg border border-base-300">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-primary">
        Admin Dashboard Stats
      </h2>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={70}
            tick={{ fill: "#2563EB", fontWeight: "600" }}
          />
          <YAxis tick={{ fill: "#2563EB", fontWeight: "600" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#F3F4F6", borderRadius: 8 }}
            itemStyle={{ color: "#2563EB", fontWeight: "bold" }}
          />
          <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminStats;