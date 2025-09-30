import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = () => {
  return (
    <div
      className="flex justify-center items-center min-h-screen backdrop-blur-md"
      aria-label="Loading"
    >
      <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
    </div>
  );
};

export default LoadingSpinner;
