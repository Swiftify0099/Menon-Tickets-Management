import {
  createBrowserRouter,
  RouterProvider,Outlet
} from "react-router-dom";
import { useState } from "react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NewTakits from "./pages/NewTakits";
import TakitsDetails from "./pages/TakitsDetails";
import Tickets from "./pages/Tickets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Sidebar from "./components/sidebar";
import Navbar from "./components/Navbar";
import ChangePassword from "./pages/ChangePassword";
import ErrorBoundary from "./components/ErrorBoundary";
import ResetPassword from "./pages/ResetPassword";

const Outlate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
const token = localStorage.getItem("token");
if(!token ){
  return <Login />
} 
  return (
    
    <div className="flex min-h-screen flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div >

  );
};


const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlate />,
    children: [
   
      { index: true, element: <Dashboard /> },
      { path: "new-takits", element: <NewTakits /> },
      { path: "takits-details/:id", element: <TakitsDetails /> },
      { path: "tickets", element: <Tickets /> },
      { path: "settings", element: <Settings /> },
      { path: "profile", element: <ErrorBoundary><Profile /></ErrorBoundary> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  {path:"change-password",element:<ChangePassword/>},
  {path:"/reset-password" ,element:<ResetPassword />}
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

export default App;
