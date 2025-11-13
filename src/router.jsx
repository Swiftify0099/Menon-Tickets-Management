import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./features/Login/components/Login";
import Dashboard from "./features/dashboard/components/Dashboard";
import Layouts from "./Layouts/Layouts";
import ForgotPass from "./features/Login/components/ForgotPass";
import Profile from "./features/Profile/components/Profile";
import UpdateProfile from "./features/Profile/components/UpdateProfile";
import Ticket from "./features/Ticket/Ticket";
import ResetPassword from "./pages/ResetPassword";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/signin" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layouts />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {path: "profile" , element: <Profile/>},
      { path: "update-profile", element: <UpdateProfile /> },
      {path: "ticket" , element: <Ticket/>},

    ],
  },
  { path: "signin", element: <Login /> },
   { path: "forgotpass", element: <ForgotPass /> },
   { path: "reset-password", element: <ResetPassword /> },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;