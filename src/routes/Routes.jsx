import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import UserDashboardLayout from "../layout/UserDashboardLayout";
import AdminDashboardLayout from "../layout/AdminDashboardLayout";

import Home from "../pages/Home";
import Meals from "../pages/Meals";
import MealDetails from "../pages/MealDetails";
import UpcomingMeals from "../pages/UpcomingMeals";
import CheckoutWithStripe from "../pages/Checkout"; 
import Packages from "../pages/Packages";

import Login from "../pages/Login";
import Register from "../pages/Register";

import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";

import ManageBookings from "../pages/ManageBookings";
import AdminMeals from "../pages/AdminMeals";
import ManageReviews from "../pages/ManageReviews";
import AddMeal from "../pages/AddMeal";
import MyReviews from "../pages/MyReviews";
import MyLikes from "../pages/MyLikes";
import MyProfile from "../pages/MyProfile";
import PaymentHistory from "../pages/PaymentHistory";
import Users from "../pages/Users";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import AdminMealStats from "../pages/AdminMealStats";
import MealReviewDetails from "../pages/MealReviewDetails";
import PublishUpcoming from "../pages/PublishUpcoming";
import RequestedMeals from "../pages/RequestedMeals";
import ServeMeals from "../pages/ServeMeals";
import StudentList from "../pages/StudentList";
import UpdateMeal from "../pages/UpdateMeal";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/meals", element: <Meals /> },
      { path: "/meal/:id", element: <MealDetails /> },
      { path: "/meal-review/:id", element: <MealReviewDetails /> },
      { path: "/upcoming", element: <UpcomingMeals /> },
      { path: "/packages", element: <Packages /> },
      { path: "/checkout/:packageName", element: <CheckoutWithStripe /> }, 
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/payment/success", element: <PaymentSuccess /> },
      { path: "/payment/cancel", element: <PaymentCancel /> },
      { path: "/unauthorized", element: <Unauthorized /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <UserDashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { path: "my-reviews", element: <MyReviews /> },
      { path: "likes", element: <MyLikes /> },
      { path: "my-profile", element: <MyProfile /> },
       { path: "requested-meals", element: <RequestedMeals /> },
      { path: "payment-history", element: <PaymentHistory /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboardLayout />
      </AdminRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { path: "bookings", element: <ManageBookings /> },
      { path: "meals", element: <AdminMeals /> },
      { path: "meals/update/:id", element: <UpdateMeal /> },
      { path: "add-meal", element: <AddMeal /> },
      { path: "reviews", element: <ManageReviews /> },
      { path: "users", element: <Users /> },
      { path: "admin-meal-stats", element: <AdminMealStats /> },
      { path: "publish-upcoming", element: <PublishUpcoming /> },
      { path: "requested-meals", element: <RequestedMeals /> },
      { path: "serve-meals", element: <ServeMeals /> },
      { path: "student-list", element: <StudentList /> },
      { path: "my-profile", element: <MyProfile /> },
    ],
  },
]);

export default router;