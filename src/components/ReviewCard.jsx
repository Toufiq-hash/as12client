import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const MotionButton = motion.button;

const ReviewCard = ({ review, refetchReviews, refetchMeal }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(review.text);

  const isOwner = currentUser?.email === review.userEmail;
  const token = localStorage.getItem("access-token");

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${review._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Review deleted");
      refetchReviews();
      refetchMeal();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/reviews/${review._id}`,
        { text: editText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Review updated");
      setIsEditing(false);
      refetchReviews();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-5 bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={review.userPhoto}
          alt="User"
          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
        />
        <div>
          <h4 className="font-semibold text-primary">{review.userName}</h4>
          <p className="text-xs text-base-content/50">
            {new Date(review.date).toLocaleString()}
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="textarea w-full rounded-md border-base-300 focus:ring-2 focus:ring-primary focus:outline-none transition"
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <MotionButton
              onClick={handleEdit}
              className="btn btn-primary text-white px-5 hover:bg-primary/90"
              whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(37, 99, 235, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </MotionButton>
            <MotionButton
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost text-primary px-5 hover:bg-base-200"
              whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(37, 99, 235, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </MotionButton>
          </div>
        </div>
      ) : (
        <p className="text-base-content">{review.text}</p>
      )}

      {isOwner && !isEditing && (
        <div className="mt-4 flex gap-4 justify-end">
          <MotionButton
            onClick={() => setIsEditing(true)}
            className="btn btn-ghost text-primary px-5 hover:bg-base-200"
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Edit
          </MotionButton>
          <MotionButton
            onClick={handleDelete}
            className="btn btn-ghost text-error px-5 hover:bg-error/10"
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Delete
          </MotionButton>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;