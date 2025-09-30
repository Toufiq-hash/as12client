import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import MembershipCard from "../components/MembershipCard"; 
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

const Packages = () => {
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get("https://exp-v9z4.onrender.com/packages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(res.data);
      } catch (err) {
        console.error("Error fetching packages:", {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
        });
        toast.error(err.response?.data?.message || "Failed to load packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner className="text-primary animate-spin w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-base-100">
      <motion.h1
        className="text-3xl font-extrabold text-center text-primary mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
      >
        Membership Packages
      </motion.h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {packages.map((pkg, idx) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <MembershipCard name={pkg.name} price={pkg.price / 100} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Packages;