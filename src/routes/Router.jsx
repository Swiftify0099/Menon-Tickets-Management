import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../Layouts/Layouts";
import Dashboard from "../pages/Dashboard";
import NewTakits from "../features/Ticket/TicketCreate/components/TicketCreate";
import TakitsDetails from "../pages/TakitsDetails";
import Tickets from "../features/Ticket/AllTickets/components/Tickets";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import ErrorBoundary from "../components/ErrorBoundary";
import Login from "../features/Login/components/Login";
import ForgotPassword from "../features/Login/components/ForgotPassword";
import ResetPassword from "../features/Login/components/ResetPassword";
import ChangePassword from "../pages/scrap/ChangePassword";
import ViewTicket from "../features/Ticket/AllTickets/components/ViewTickets";
import UpdateTicket from "../features/Ticket/AllTickets/components/UpdateTicket";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "new-takits", element: <NewTakits /> },
      { path: "takits-details/:id", element: <TakitsDetails /> },
      { path: "tickets", element: <Tickets /> },
      { path: "settings", element: <Settings /> },
      { path: "/ticket/:id", element: <ViewTicket /> },
      { path: "/update-ticket/:id", element: <UpdateTicket /> },


      {
        path: "profile",
        element: (
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/change-password", element: <ChangePassword /> },

  {
    path: "*",
    element: (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-2xl">
          <h1 className="text-9xl font-bold text-orange-600">404</h1>
          <p className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</p>
          <button
            onClick={() => window.history.back()}
            className="mt-8 px-8 py-3 bg-orange-600 text-white text-lg rounded-lg hover:bg-orange-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    ),
  },
]);

export default router;