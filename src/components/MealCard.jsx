import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";


const MealCard = ({ meal, showCategory = false, badgeText = "New" }) => {
  const { _id, title, photoUrl, price, rating, category } = meal || {};

  const displayPhoto = photoUrl || "/fallback-image.jpg"; 
  const displayRating = rating ?? "N/A";
  const displayCategory = category || "General";

 
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)", transition: { type: "spring", stiffness: 300 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.2 } }),
  };

  return (
    <motion.div
      className="card w-80 rounded-2xl shadow-xl overflow-hidden border border-base-300"
      style={{
        background: "rgba(255, 255, 255, 0.95)", // Fallback for bg-base-100
      }}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <figure className="relative">
        <motion.img
          src={displayPhoto}
          alt={title || "Meal Image"}
          className="h-52 w-full object-cover"
          variants={contentVariants}
          custom={0}
          whileHover={{ scale: 1.1 }}
        />
        
        <motion.div
          className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-md"
          variants={contentVariants}
          custom={1}
          whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)" }}
        >
          <FaStar className="text-yellow-300" />
          {displayRating}
        </motion.div>
        
        {badgeText && (
          <motion.div
            className="absolute top-3 right-3 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md"
            variants={contentVariants}
            custom={2}
            whileHover={{ scale: 1.1 }}
          >
            {badgeText}
          </motion.div>
        )}
      </figure>

      <div className="card-body space-y-2 p-6">
        <motion.h2
          className="card-title text-xl font-bold"
          variants={contentVariants}
          custom={3}
        >
          <span className="text-primary">{title?.split(" ")[0] || "Untitled"}</span>
          <span className="text-secondary">{title?.split(" ").slice(1).join(" ") || "Meal"}</span>
        </motion.h2>
        {showCategory && (
          <motion.p
            className="text-sm text-base-content"
            variants={contentVariants}
            custom={4}
          >
            Category: <span className="text-secondary">{displayCategory}</span>
          </motion.p>
        )}
        <motion.p
          className="text-lg font-semibold text-secondary"
          variants={contentVariants}
          custom={5}
        >
          ${price ?? "N/A"}
        </motion.p>

        <div className="card-actions justify-end">
          <motion.div
            whileHover={{ scale: 1.1, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to={`/meal/${_id}`}
              className="btn btn-primary text-white rounded-full px-5 py-2 hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MealCard;