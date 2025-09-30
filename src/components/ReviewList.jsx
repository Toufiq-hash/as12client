import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReviewCard from "./ReviewCard";
import { motion, AnimatePresence } from "framer-motion";

const ReviewList = ({ mealId, refetchMeal }) => {
  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["reviews", mealId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/meal/${mealId}`);
      return res.data;
    },
  });

  return (
    <div className="mt-4 space-y-6">
      <AnimatePresence>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ReviewCard
                review={review}
                refetchReviews={refetch}
                refetchMeal={refetchMeal}
              />
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-base-content/50 text-center italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No reviews yet. Be the first to write one!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewList;