import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

const Banner = () => {
  return (
    <div
      className="hero min-h-[70vh] text-base-content px-4 sm:px-6 lg:px-8 overflow-hidden bg-base-100"
    >
      <div className="hero-content flex-col lg:flex-row-reverse gap-6 lg:gap-12 max-w-7xl mx-auto">
        {/* 3D Tilt Image */}
        <Tilt
          glareEnable
          glareMaxOpacity={0.3}
          glareColor="#FFFFFF"
          scale={1.1}
          tiltMaxAngleX={15}
          tiltMaxAngleY={15}
          className="w-full lg:w-auto"
        >
          <motion.img
            src="https://us.123rf.com/450wm/artinspiring/artinspiring2107/artinspiring210701144/172221145-booking-a-hotel-concept-traveling-and-tourism-planning-booking-apartment.jpg?ver=6"
            alt="Meal Banner"
            className="max-w-xs sm:max-w-sm rounded-3xl shadow-2xl border border-base-300 mx-auto"
            initial={{ opacity: 0, x: 100, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)" }}
            transition={{ duration: 1, type: "spring", stiffness: 300 }}
          />
        </Tilt>

        {/* Text + Input + Button */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full lg:w-1/2 text-center lg:text-left"
        >
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-primary">Welcome to </span>
            <span className="text-secondary">HostelMate</span>
          </motion.h1>
          <motion.p
            className="py-4 sm:py-6 text-lg sm:text-xl text-base-content/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Manage your hostel meals and reviews with ease, speed, and joy!
          </motion.p>

          {/* Search Bar & Animated Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <motion.input
              type="text"
              placeholder="Search Meals..."
              className="input input-bordered w-full max-w-xs bg-base-100 text-base-content placeholder-base-content/50 border-base-300 focus:border-primary focus:ring focus:ring-primary/50 transition-all duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileFocus={{ scale: 1.02, boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)" }}
            />
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              Search
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Banner;