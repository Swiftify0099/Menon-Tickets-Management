// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getProfile } from '../api/ProfileApi';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setUser(res.data.user);
            } catch (err) {
                setError("Failed to load profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="text-red-600 text-xl font-bold">{error || "No user data"}</div>
            </div>
        );
    }
    const fullName = `${user.first_name} ${user.last_name}`;
    return (
        <div className="p-46">
            <div className=" bg-white shadow ">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="grid grid-cols-3 text-center order-last md:order-first mt-20 md:mt-0">
                    </div>
                    <div className="relative">
                        <div className="w-48 h-48 bg-indigo-100 mx-auto rounded-full shadow-2xl absolute inset-x-0 top-0 -mt-24 flex items-center justify-center text-indigo-500 overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <svg
                                className="h-24 w-24"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{ display: user.avatar ? 'none' : 'block' }}
                            >
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
                        <button className="text-white py-2 px-4 uppercase rounded bg-orange-400 hover:bg-orange-600 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5">
                            Update
                        </button>

                    </div>
                </div>

                <div className="mt-20 text-center border-b pb-12">
                    <h1 className="text-4xl font-medium text-gray-700">
                        {fullName}, <span className="font-light text-gray-500">27</span>
                    </h1>
                    <p className="font-light text-gray-600 mt-3">Pune, India</p>
                    <p className="mt-8 text-gray-500">{user.role.role_name} - Creative Tim Officer</p>
                    <p className="mt-2 text-gray-500">University of Computer Science</p>

                    <div className="mt-6 space-y-2">
                        <p className="text-gray-600">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-gray-600">
                            <strong>Phone:</strong> {user.phone}
                        </p>
                        <p className="text-orange-600 font-medium">
                            <strong>Role:</strong> {user.role.role_name} (ID: {user.role.role_id})
                        </p>
                        <p className="text-gray-600">
                            <strong>User ID:</strong> {user.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;