import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/login";
import Logo from "../assets/logo.png";

const Navbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileUpdated, setProfileUpdated] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);

  // ✅ Load profile reactively
  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");
    const savedUser = localStorage.getItem("user");
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    setUser(parsedProfile || parsedUser);
  }, [profileUpdated]);

  // ✅ Reflect localStorage updates
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
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <Menu size={22} className="text-gray-700" />
        </button>
        <img
          src={Logo}
          alt="Logo"
          className="h-9 w-9 object-contain drop-shadow-sm"
        />
        <h1 className="text-lg md:text-xl font-semibold text-orange-500 tracking-wide">
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
              {`${currentUser?.first_name || ""} ${
                currentUser?.last_name || ""
              }`}
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

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-all duration-200"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} />
              Profile
            </Link>

            <button
              onClick={() => {
                setDropdownOpen(false);
                handleChangePassword();
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-all duration-200 w-full text-left"
            >
              <Lock size={16} />
              Change Password
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-all duration-200 w-full text-left"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
