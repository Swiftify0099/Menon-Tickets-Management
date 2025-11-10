import React from 'react'
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import {
  Home,
  ListChecks,
} from "lucide-react";
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed md:relative  top-0 left-0 h-full md:h-auto md:w-44 w-54  bg-gray-100 shadow-lg flex flex-col justify-between border-r border-gray-200 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div>
          <nav className="mt-10 md:mt-4 px-4">
            <ul className="space-y-1">
              {[
                { to: "/", icon: Home, label: "Dashbord" },

                {
                  to: "/tickets",
                  icon: ListChecks,
                  label: "Tickets",
                },


              ].map(({ to, icon: Icon, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4  py-2 text-xs-1 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition"
                  >
                    <Icon size={20} />
                    <h1>{label}</h1>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="text-center border-t p-4">
          <p className="text-sm text-gray-500">© 2025 MyCompany</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;