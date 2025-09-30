import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import ThreeDButton from "../components/ThreeDButton";

const MyProfile = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 bg-base-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-base-100 p-8 rounded-[30px] shadow-2xl border-4 border-base-200 w-full max-w-md"
      >
        <motion.img
          src={currentUser?.photoURL }
          alt="User"
          className="w-24 h-24 mx-auto rounded-full shadow-md mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <h2 className="text-3xl font-bold text-primary">{currentUser?.displayName}</h2>
        <p className="text-base-content/70 mb-2">{currentUser?.email}</p>
        <p className="badge badge-outline badge-primary mt-2">
          {currentUser?.badge || "Basic"}
        </p>

        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <ThreeDButton
              label="Logout"
              onClick={logout}
              className="btn btn-primary btn-sm px-4 py-2 rounded-full text-white hover:bg-primary/90 transition-all duration-300"
            >
              logout
            </ThreeDButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfile;
