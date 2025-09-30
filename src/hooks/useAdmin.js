
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const useAdmin = () => {
  const { currentUser } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["isAdmin", currentUser?.email],
    enabled: !!currentUser?.email,
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/admin/${currentUser.email}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access-token")}`,
        },
      });
      return res.data?.isAdmin === true;
    },
  });

  return [isAdmin, isLoading];
};

export default useAdmin;
