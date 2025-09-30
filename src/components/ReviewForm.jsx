import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "framer-motion";

const MotionButton = motion.button;

const ReviewForm = ({ mealId, refetch }) => {
  const { currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!currentUser) {
      toast.error("Login required to post a review");
      return;
    }

    const review = {
      mealId,
      userEmail: currentUser.email,
      userName: currentUser.displayName || "Anonymous",
      userPhoto: currentUser.photoURL,
      comment: data.text,       
      createdAt: new Date(),    
    };

    try {
      const token = localStorage.getItem("access-token"); 

      await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews`,
        review,
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Send token in header
          },
        }
      );

      toast.success("Review added!");
      reset();
      refetch();
    } catch (err) {
      toast.error("Failed to post review");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <textarea
        {...register("text", { required: true })}
        className="textarea w-full rounded-md border-base-300 focus:ring-2 focus:ring-primary focus:outline-none transition"
        placeholder="Write your review here..."
        rows={4}
      />
      {errors.text && (
        <p className="text-error text-sm -mt-2">Review cannot be empty.</p>
      )}

      <MotionButton
        type="submit"
        className="btn btn-primary text-white px-6 py-2 shadow-md rounded-md hover:bg-primary/90"
        whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(37, 99, 235, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Submit Review
      </MotionButton>
    </form>
  );
};

export default ReviewForm;