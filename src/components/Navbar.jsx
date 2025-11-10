import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/login';

const Navbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);

  useEffect(() => {
    const savedLogin = localStorage.getItem("user");
    const parsedUser = savedLogin ? JSON.parse(savedLogin) : null;
    setUser(parsedUser);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-5 py-1 flex justify-between items-center">
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

      {/* Right side - Profile Card */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          

          {/* Name + Role vertically aligned */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-800 leading-tight">
              {(loginState?.user?.first_name || user?.first_name || '') +
                ' ' +
                (loginState?.user?.last_name || user?.last_name || '')}
            </span>
            <small className="text-gray-500  text-xs">
              {user?.role?.role_name ? `${user?.role?.role_name}` : ''}
            </small>
            
          </div>
          <img
            src={loginState?.user?.avatar || user?.avatar || '/default-avatar.png'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </button>


        {/* Dropdown Menu */}
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
