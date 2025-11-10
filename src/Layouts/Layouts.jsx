import React, { useEffect } from 'react';
import Navbar from '../components/Navbar/components/Navbar';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

const Layouts = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);


    return (
        <div className="min-h-screen bg-gray-100">
           
            <div className="flex">
                <Sidebar />
              
                <div className="flex-1 lg:ml-50 mt-16 p-6 overflow-y-auto min-h-screen">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layouts;