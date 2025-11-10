import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/login';

const Navbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileUpdated, setProfileUpdated] = useState(0); // ✅ dependency variable
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);

  // ✅ Load profile from localStorage whenever profileUpdated changes
  useEffect(() => {
    const savedProfile = localStorage.getItem('profile');
    const parsedUser = savedProfile ? JSON.parse(savedProfile) : null;
    setUser(parsedUser);
  }, [profileUpdated]); // 🔥 reactively reload when profileUpdated changes

  // ✅ Detect and reflect localStorage updates instantly (cross-tab + same-tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'profile') {
        setProfileUpdated((prev) => prev + 1); // trigger reload
      }
    };

    // ✅ Listen for browser storage events
    window.addEventListener('storage', handleStorageChange);

    // ✅ Intercept localStorage.setItem to detect same-tab updates
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'profile') {
        window.dispatchEvent(new StorageEvent('storage', { key })); // trigger handleStorageChange
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem; // cleanup
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const currentUser = user || loginState?.user;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center">
      {/* Left side - Hamburger menu and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-orange-500">
          Menon Ticket Management System
        </h2>
      </div>

      {/* Right side - Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="hidden sm:flex flex-col items-end text-sm leading-tight">
            <span className="font-medium text-gray-800 capitalize">
              {`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`}
            </span>
            <span className="text-xs text-gray-500">
              {currentUser?.role?.role_name || 'User'}
            </span>
          </div>

          <img
            src={currentUser?.avatar || '/default-avatar.png'}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-5 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
            >
              <Lock size={16} />
              Change Password
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
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
