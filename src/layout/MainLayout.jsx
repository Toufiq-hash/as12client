import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const MainLayout = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-base-100">
      <Navbar />
      <motion.main
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
};

export default MainLayout;