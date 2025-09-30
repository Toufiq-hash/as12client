import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUserShield, FaTrashAlt, FaSearch } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const token = localStorage.getItem("access-token");

  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  
  useEffect(() => {
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch))
    );
    setFilteredUsers(filtered);
  }, [debouncedSearchTerm, users]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/my-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Error fetching current user:", err);
      toast.error("Failed to verify user permissions.");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/users/admin/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.modifiedCount > 0) {
        toast.success("User promoted to Admin!");
        await fetchUsers();
      } else {
        toast.error("User is already an admin or not found.");
      }
    } catch (err) {
      console.error("Error promoting user:", err);
      toast.error(err.response?.data?.message || "Failed to update role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading || !userToDelete) return;
    setActionLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/users/${userToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.deletedCount > 0) {
        toast.success("User deleted successfully!");
        await fetchUsers();
      } else {
        toast.error("User not found.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setUserToDelete(null);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 text-center bg-base-100 dark:bg-base-100-dark">
        <p className="text-error dark:text-error-dark">Access denied: Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-100 dark:bg-base-100-dark">
      <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-dark">All Users</h2>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by username or email..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark border-base-300 dark:border-base-100-dark focus:border-primary dark:focus:border-primary-dark focus:ring focus:ring-primary/20 dark:focus:ring-primary-dark/20"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 dark:text-base-content-dark/50" />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-center text-primary dark:text-primary-dark">
          {searchTerm ? `No users found for "${searchTerm}"` : "No users found."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-base-200 dark:bg-base-200-dark text-base-content dark:text-base-content-dark">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Make Admin</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user._id}
                  className={i % 2 === 0 ? "bg-base-100 dark:bg-base-100-dark" : "bg-base-200 dark:bg-base-200-dark"}
                >
                  <td className="p-3 text-base-content dark:text-base-content-dark">{i + 1}</td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.name || "N/A"}</td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.email}</td>
                  <td className="p-3 text-base-content dark:text-base-content-dark">{user.role === "admin" ? "Admin" : "Student"}</td>
                  <td className="p-3">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleMakeAdmin(user._id)}
                        className="btn btn-sm bg-secondary/20 dark:bg-secondary-dark/60 text-secondary dark:text-secondary-dark border border-secondary dark:border-secondary-dark hover:bg-secondary/30 dark:hover:bg-secondary-dark/70 shadow-sm hover:shadow-md transition-all duration-200"
                        disabled={actionLoading}
                      >
                        <FaUserShield className="mr-1" />
                        Make Admin
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="btn btn-sm bg-error/20 dark:bg-error-dark/50 text-error dark:text-error-dark border border-error dark:border-error-dark hover:bg-error/30 dark:hover:bg-error-dark/60 shadow-sm hover:shadow-md transition-all duration-200"
                      disabled={actionLoading || user.email === currentUser?.email}
                    >
                      <FaTrashAlt className="mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 dark:bg-base-200-dark p-6 rounded-lg shadow-xl max-w-md w-full border border-base-300 dark:border-base-100-dark">
            <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-4">
              Confirm Deletion
            </h3>
            <p className="text-base-content dark:text-base-content-dark mb-6">
              Are you sure you want to delete the user{" "}
              <span className="font-semibold">{userToDelete?.name || "N/A"}</span> (
              {userToDelete?.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="btn btn-sm bg-base-200 dark:bg-base-200-dark text-base-content dark:text-base-content-dark hover:bg-base-300 dark:hover:bg-base-300-dark border border-base-300 dark:border-base-100-dark"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-sm bg-error dark:bg-error-dark text-white hover:bg-error/80 dark:hover:bg-error-dark/80 border border-error dark:border-error-dark"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
