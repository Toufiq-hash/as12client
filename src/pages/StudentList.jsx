import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const StudentList = () => {
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const token = localStorage.getItem("access-token");
      if (!token) throw new Error("JWT token not found");

      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    },
    onError: (err) => {
      toast.error("Failed to load users");
      console.error(err);
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-base-100 dark:bg-base-100-dark rounded shadow text-center text-error dark:text-error-dark">
        Failed to load students.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-base-100 dark:bg-base-100-dark rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-dark">Registered Students</h2>
      {users.length === 0 ? (
        <p className="text-center text-primary dark:text-primary-dark">No students registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-base-200 dark:bg-base-200-dark text-base-content dark:text-base-content-dark">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Joined At</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className={index % 2 === 0 ? "bg-base-100 dark:bg-base-100-dark" : "bg-base-200 dark:bg-base-200-dark"}
                >
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.name || "N/A"}</td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.email}</td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.role || "student"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;