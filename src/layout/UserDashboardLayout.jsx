import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Heart, ClipboardList, Home, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserDashboardLayout = () => {
  const links = [
    { to: "/", label: "Home", icon: <Home size={14} /> },
    { to: "my-profile", label: "My Profile", icon: <User size={14} /> },
    { to: "my-reviews", label: "My Reviews", icon: <ClipboardList size={14} /> },
    { to: "likes", label: "My Likes", icon: <Heart size={14} /> },
    { to: "requested-meals", label: "Requested Meals", icon: <ClipboardList size={14} /> },
    { to: "payment-history", label: "Payment History", icon: <ClipboardList size={14} /> },
  ];
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-base-100">
      <aside className="col-span-3 bg-base-100 shadow-lg p-6 rounded-r-lg sticky top-0 h-screen">
        <h2 className="text-2xl font-bold mb-6 text-primary">Student Panel</h2>
        <ul className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-3 rounded-md font-semibold text-error hover:bg-error/10 transition bg-base-100"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
          {links.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-md font-semibold transition 
                  ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-base-content hover:bg-base-200 hover:text-primary"
                  }`
                }
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
      <main className="col-span-9 p-8 bg-base-100 rounded-l-lg shadow-inner">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboardLayout;