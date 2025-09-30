import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useAdmin from "../hooks/useAdmin";
import { FaBell, FaSun, FaMoon } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import defaultAvatar from "../assets/react.svg";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isAdmin] = useAdmin();
  const [theme, setTheme] = useState("light");

  
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <motion.nav
      className="bg-base-100 dark:bg-base-100-dark shadow-md w-full z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        <motion.div
          className="flex items-center gap-2 transition-transform"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://pbs.twimg.com/profile_images/856067815530483717/sn2FZ1WD_400x400.jpg"
              alt="HostelMate Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <div className="flex flex-col sm:flex-row">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-primary-dark">
                Hostel
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-secondary dark:text-secondary-dark">
                Mate
              </span>
            </div>
          </Link>
        </motion.div>

        
        <div className="flex items-center gap-2 sm:gap-4">
          
          {["/meals", "/upcoming"].map((path, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Link
                to={path}
                className="btn btn-ghost btn-sm px-3 py-2 rounded-lg hover:bg-base-200 dark:hover:bg-base-200-dark transition-all duration-300 text-primary dark:text-primary-dark"
              >
                {path === "/meals" ? "Meals" : "Upcoming"}
              </Link>
            </motion.div>
          ))}

          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle text-primary dark:text-primary-dark hover:bg-base-200 dark:hover:bg-base-200-dark"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>
          </motion.div>

          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              className="btn btn-ghost btn-circle text-primary dark:text-primary-dark hover:bg-base-200 dark:hover:bg-base-200-dark"
              title="Notifications"
            >
              <FaBell size={20} className="animate-pulse" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-error dark:bg-error-dark rounded-full animate-pulse"></span>
            </button>
          </motion.div>

          
          {!currentUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Link
                to="/login"
                className="btn btn-primary btn-sm px-4 sm:px-6 py-2 rounded-full transition-all duration-300 text-white hover:bg-primary/90 dark:hover:bg-primary-dark/90"
              >
                Join Us
              </Link>
            </motion.div>
          ) : (
            <div className="dropdown dropdown-end relative">
              <motion.label
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <img
                  src={currentUser?.photoURL || defaultAvatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </motion.label>
              <motion.ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 p-4 shadow bg-base-100 dark:bg-base-100-dark rounded-xl w-56 border border-base-300 dark:border-base-100-dark text-base-content dark:text-base-content-dark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <li className="mb-3 font-semibold text-center cursor-default text-base-content dark:text-base-content-dark">
                  {currentUser?.displayName || "User"}
                </li>
                <li>
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    className="hover:bg-base-200 dark:hover:bg-base-200-dark rounded-md px-3 py-2 transition-all text-sm text-base-content dark:text-base-content-dark"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="text-error dark:text-error-dark hover:bg-error/10 dark:hover:bg-error-dark/10 rounded-md px-3 py-2 transition-all w-full text-left text-sm"
                  >
                    Logout
                  </button>
                </li>
              </motion.ul>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;