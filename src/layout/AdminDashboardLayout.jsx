import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart,
  Users,
  ListOrdered,
  Plus,
  ClipboardList,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: <Home size={14} /> },
    { to: "my-profile", label: "My Profile", icon: <User size={14} /> },
    { to: "bookings", label: "Manage Bookings", icon: <ClipboardList size={14} /> },
    { to: "meals", label: "Manage Meals", icon: <ListOrdered size={14} /> },
    { to: "add-meal", label: "Add Meal", icon: <Plus size={14} /> },
    { to: "reviews", label: "Manage Reviews", icon: <ClipboardList size={14} /> },
    { to: "users", label: "Users", icon: <Users size={14} /> },
    { to: "admin-meal-stats", label: "Meal Stats", icon: <BarChart size={14} /> },
    { to: "publish-upcoming", label: "Publish Upcoming", icon: <ClipboardList size={14} /> },
    { to: "requested-meals", label: "Requested Meals", icon: <ClipboardList size={14} /> },
    { to: "serve-meals", label: "Serve Meals", icon: <ClipboardList size={14} /> },
    { to: "student-list", label: "Student List", icon: <Users size={14} /> },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-12 bg-base-100">
      <aside className="md:col-span-3 bg-base-100 p-6 h-screen md:sticky md:top-0 shadow-md rounded-r-lg flex flex-col">
        <h2
          className="text-2xl font-bold mb-6 border-b border-base-300 pb-3 text-primary"
          role="heading"
          aria-level="2"
        >
          Admin Panel
        </h2>

        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-2 p-3 mb-6 rounded-md font-medium text-error hover:bg-error/10 transition bg-base-100 text-sm ${
            isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Logout"
        >
          <LogOut size={14} />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>

        
        <nav aria-label="Admin navigation">
          <ul className="space-y-1">
            {links.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to.startsWith("/") ? to : `/admin/${to}`}
                  end={to !== "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg transition-colors duration-300 font-medium text-sm ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-base-content hover:bg-base-200 hover:text-primary"
                    }`
                  }
                  aria-current={({ isActive }) =>
                    isActive ? "page" : undefined
                  }
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="md:col-span-9 p-8 bg-base-100 rounded-l-lg min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
