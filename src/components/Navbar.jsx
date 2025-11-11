import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, Lock, Home } from "lucide-react"; // Added Home
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/login";
import Logo from "../assets/menon-logo.png";

const Navbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileUpdated, setProfileUpdated] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);

  // Load profile reactively
  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");
    const savedUser = localStorage.getItem("user");
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    setUser(parsedProfile || parsedUser);
  }, [profileUpdated]);

  // Reflect localStorage updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "profile" || event.key === "user") {
        setProfileUpdated((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "profile" || key === "user") {
        window.dispatchEvent(new StorageEvent("storage", { key }));
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const currentUser = user || loginState?.user;

  return (
    <nav
      className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* Left - Logo + Title */}
      <div className="flex items-center gap-4">
        <img
          src={Logo}
          alt="Logo"
          className="h-15 w-15 object-contain drop-shadow-sm"
        />
        <h1 className="text-2xl md:text-3xl font-extrabold text-orange-500 tracking-wide drop-shadow-md">
          Menon Ticket System
        </h1>
      </div>
      {/* Right - Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100"
        >
          <div className="hidden sm:flex flex-col items-end text-sm leading-tight">
            <span className="font-medium text-gray-800 capitalize tracking-wide">
              {`${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "User"}
            </span>
            <span className="text-xs text-gray-500 font-light">
              {currentUser?.role?.role_name || "User"}
            </span>
          </div>
          <img
            src={currentUser?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
            {/* Profile */}
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} />
              <span>Profile</span>
            </Link>
            
               {/* Home - Now with icon & same style */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200 w-full text-left"
            >
              <Home size={16} />
              <span>Home</span>
            </button>

            {/* Change Password */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChangePassword();
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200 w-full text-left"
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>

         

            {/* Logout */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left mt-1 border-t border-gray-100 pt-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;