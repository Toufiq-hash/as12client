import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FaGoogle } from "react-icons/fa";

const Register = () => {
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    console.log(`Input changed: ${e.target.name} = "${e.target.value}"`); // Log input value
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    const { name, email, password } = formData;
    if (!name || name.length < 2) {
      return "Name must be at least 2 characters long.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (formData.photoURL && !isValidUrl(formData.photoURL)) {
      return "Please enter a valid URL for the photo.";
    }
    return "";
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      toast.error(validationError);
      return;
    }

    const { name, email, photoURL, password } = formData;
    console.log("Form data before registration:", { name, email, photoURL, password }); // Log before submission

    try {
      console.log("Attempting registration:", { email, name, photoURL });
      await registerUser(email, password, name, photoURL); // Pass photoURL directly (no || null)
      toast.success("Registered successfully!");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        response: err.response?.data,
      });
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Attempting Google sign-up");
      await googleLogin();
      toast.success("Signed up with Google!");
      navigate("/");
    } catch (err) {
      console.error("Google sign-up error:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        response: err.response?.data,
      });
      const errorMessage = err.message || "Google sign-up failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-base-100 dark:bg-base-100-dark text-base-content dark:text-base-content-dark">
      <div className="bg-base-100 dark:bg-base-100-dark p-8 rounded-lg shadow-md" style={{ width: "400px", minHeight: "560px" }}>
        <h2 className="text-2xl font-bold mb-6 text-center text-primary dark:text-primary-dark">Register</h2>

        {error && <p className="text-error dark:text-error-dark text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content dark:text-base-content-dark">Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              value={formData.name}
              required
              className="w-full h-10 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark px-3 rounded focus:outline-none focus:outline-primary dark:focus:outline-primary-dark shadow-inner"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content dark:text-base-content-dark">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full h-10 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark px-3 rounded focus:outline-none focus:outline-primary dark:focus:outline-primary-dark shadow-inner"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content dark:text-base-content-dark">Photo URL (optional)</label>
            <input
              type="url"
              name="photoURL"
              onChange={(e) => {
                console.log("photoURL input:", e.target.value);
                handleChange(e);
              }}
              value={formData.photoURL}
              className="w-full h-10 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark px-3 rounded focus:outline-none focus:outline-primary dark:focus:outline-primary-dark shadow-inner"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content dark:text-base-content-dark">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full h-10 border border-base-300 dark:border-base-100-dark bg-base-100 dark:bg-base-200-dark text-base-content dark:text-base-content-dark px-3 rounded focus:outline-none focus:outline-primary dark:focus:outline-primary-dark shadow-inner"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn w-full h-11 bg-primary/20 dark:bg-primary-dark/60 text-primary dark:text-primary-dark border border-primary dark:border-primary-dark hover:bg-primary/30 dark:hover:bg-primary-dark/70 shadow-sm hover:shadow-md transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-base-content dark:text-base-content-dark">
          Already have an account?{" "}
          <Link to="/login" className="text-primary dark:text-primary-dark hover:underline">
            Login
          </Link>
        </p>

        <div className="mt-6">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 border border-base-300 dark:border-base-100-dark bg-primary/10 dark:bg-primary-dark/40 text-primary dark:text-primary-dark py-2 rounded hover:bg-primary/20 dark:hover:bg-primary-dark/50 transition text-sm font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FaGoogle className="text-lg" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;