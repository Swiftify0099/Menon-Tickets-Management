// src/features/Navbar/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Lock, Home } from "lucide-react";
import Logo from "../assets/menon-logo.png";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    // Initial load from localStorage
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  const navigate = useNavigate();

  // ✅ Whenever localStorage changes, update Navbar
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    // listen for localStorage updates (even from same tab)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      window.dispatchEvent(new Event("storage"));
    };

    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function (key) {
      originalRemoveItem.apply(this, arguments);
      window.dispatchEvent(new Event("storage"));
    };

    const originalClear = localStorage.clear;
    localStorage.clear = function () {
      originalClear.apply(this, arguments);
      window.dispatchEvent(new Event("storage"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const handleChangePassword = () => {
    setDropdownOpen(false);
    navigate("/change-password");
  };

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
          className="h-12 w-12 object-contain drop-shadow-sm"
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
              {`${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                "User"}
            </span>
            <span className="text-xs text-gray-500 font-light">
              {user?.role?.role_name || "User"}
            </span>
          </div>
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} />
              <span>Profile</span>
            </Link>

            {/* <button
              onClick={() => {
                setDropdownOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200 w-full text-left"
            >
              <Home size={16} />
              <span>Home</span>
            </button> */}

            <button
              onClick={handleChangePassword}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-all duration-200 w-full text-left"
            >
              <Lock size={16} />
              <span>Change Password</span>
            </button>

            <button
              onClick={handleLogout}
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