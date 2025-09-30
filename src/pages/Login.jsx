import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = formData;

    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await googleLogin();
      toast.success("Logged in with Google!");
      navigate("/");
    } catch (err) {
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100 px-4 text-base-content">
      <div
        className="bg-base-100 p-8 rounded-lg shadow-md"
        style={{ width: "400px", minHeight: "460px" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Login</h2>

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full h-10 border border-base-300 px-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full h-10 border border-base-300 px-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary text-white w-full h-11 hover:bg-primary/90 ${loading ? "loading" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-base-content">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 border border-base-300 py-2 rounded hover:bg-base-200 transition text-sm font-medium text-base-content ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FaGoogle className="text-lg text-primary" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;