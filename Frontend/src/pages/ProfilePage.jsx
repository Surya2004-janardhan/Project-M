import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-red-700">Manage your account information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-amber-900 font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? formData.name : user.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all ${
                    isEditing
                      ? "border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="block text-amber-900 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={isEditing ? formData.email : user.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all ${
                    isEditing
                      ? "border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div className="text-center space-x-4">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-red-800 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-amber-100">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <span className="text-amber-900 font-semibold">
                    Account Created:
                  </span>
                  <p className="text-red-700">Recently</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <span className="text-amber-900 font-semibold">
                    Last Login:
                  </span>
                  <p className="text-red-700">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
