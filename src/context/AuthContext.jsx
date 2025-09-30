import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import axios from "axios";
import toast from "react-hot-toast";

const auth = getAuth(app);
const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://exp-v9z4.onrender.com";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access-token") || null);
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();

  const fetchUserData = async (email, token) => {
    try {
      console.log("Fetching user data for:", email);
      const res = await axios.get(`${API_BASE_URL}/users/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data;
      console.log("User data fetched:", userData);
      localStorage.setItem("user-role", userData.role || "user");
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

  const register = async (email, password, name, photoURL) => {
    setLoading(true);
    try {
      console.log("Registering user:", { email, name, photoURL });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name, photoURL });
      console.log("Firebase user created:", { uid: user.uid, email, photoURL: user.photoURL });

      const idToken = await user.getIdToken();
      console.log("Firebase ID token obtained for registration");

      
      console.log("Sending to backend /users:", { email, name, photoURL, role: "user" });
      await axios.post(`${API_BASE_URL}/users`, {
        email,
        name: name || email.split("@")[0],
        photoURL,
        role: "user",
      }).catch((error) => {
        if (error.response?.status === 409) {
          console.log(`User already exists in backend: ${email}, proceeding to login`);
        } else {
          throw error;
        }
      });

      
      const loginRes = await axios.post(`${API_BASE_URL}/login`, {
        idToken,
        email,
      });
      const newToken = loginRes.data.token;
      if (!newToken) throw new Error("No token received from /login");
      localStorage.setItem("access-token", newToken);
      setToken(newToken);

      const userData = await fetchUserData(email, newToken);
      setCurrentUser({ ...user, ...userData });
      toast.success("Registration successful!");
      return userCredential;
    } catch (error) {
      console.error("Registration error:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email already in use. Please log in or use a different email.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format.");
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Invalid registration data.");
      }
      throw new Error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log("Logging in user:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      console.log("Firebase ID token obtained for login");

      const loginRes = await axios.post(`${API_BASE_URL}/login`, {
        idToken,
        email,
      });
      const newToken = loginRes.data.token;
      if (!newToken) throw new Error("No token received from /login");
      localStorage.setItem("access-token", newToken);
      setToken(newToken);

      const userData = await fetchUserData(email, newToken);
      setCurrentUser({ ...user, ...userData });
      console.log("Login successful:", { email, token: newToken, role: userData.role });
      toast.success("Logged in successfully!");
      return userCredential;
    } catch (error) {
      console.error("Login error:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        throw new Error("No user found with this email. Please register.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many attempts. Please try again later.");
      }
      throw new Error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      console.log("Initiating Google login");
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      console.log("Firebase ID token obtained for Google login");
      console.log("Google user data:", { email: user.email, photoURL: user.photoURL });

      await axios.post(`${API_BASE_URL}/users`, {
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL,
        googleAuth: true,
        role: "user",
      }).catch((error) => {
        if (error.response?.status !== 409) throw error;
      });

      const loginRes = await axios.post(`${API_BASE_URL}/login`, {
        idToken,
        email: user.email,
      });
      const newToken = loginRes.data.token;
      if (!newToken) throw new Error("No token received from /login");
      localStorage.setItem("access-token", newToken);
      setToken(newToken);

      const userData = await fetchUserData(user.email, newToken);
      setCurrentUser({ ...user, ...userData });
      console.log("Google login successful:", { email: user.email, token: newToken, role: userData.role });
      toast.success("Logged in with Google!");
      return userCredential;
    } catch (error) {
      console.error("Google login error:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      throw new Error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log("Logging out user:", currentUser?.email);
      localStorage.removeItem("access-token");
      localStorage.removeItem("user-role");
      setToken(null);
      setCurrentUser(null);
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    } finally {
      setLoading(false);
    }
  };

  const refetchUser = async () => {
    if (!currentUser?.email || !token) return;
    setLoading(true);
    try {
      const userData = await fetchUserData(currentUser.email, token);
      setCurrentUser((prev) => ({ ...prev, ...userData }));
      console.log("User data refetched:", userData);
    } catch (error) {
      console.error("Refetch user error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      toast.error("Failed to refresh user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged: Current user:", user?.email || "No user");
      if (user?.email) {
        try {
          const idToken = await user.getIdToken();
          console.log("Firebase ID token obtained in onAuthStateChanged");

          const loginRes = await axios.post(`${API_BASE_URL}/login`, {
            idToken,
            email: user.email,
          });
          const newToken = loginRes.data.token;
          if (!newToken) throw new Error("No token received from /login");
          localStorage.setItem("access-token", newToken);
          setToken(newToken);

          const userData = await fetchUserData(user.email, newToken);
          setCurrentUser({ ...user, ...userData });
          console.log("User data set:", userData);
        } catch (error) {
          console.error("Auth initialization error:", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            email: user.email,
          });
          toast.error(error.response?.data?.message || "Failed to authenticate. Please log in again.");
          localStorage.removeItem("access-token");
          localStorage.removeItem("user-role");
          setToken(null);
          setCurrentUser(null);
        }
      } else {
        console.log("No user, clearing auth state");
        localStorage.removeItem("access-token");
        localStorage.removeItem("user-role");
        setToken(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    token,
    loading,
    role: currentUser?.role,
    register,
    login,
    googleLogin,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};