import React, { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { adminAPI } from "../api/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getAdminData();
      if (result.success) {
        setIsAdmin(true);
        loadAllUsers();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Access denied");
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const result = await adminAPI.getAllUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to load users");
    }
  };

  const loadUserDetails = async (userId) => {
    setLoading(true);
    try {
      const result = await adminAPI.getUserById(userId);
      if (result.success) {
        setSelectedUser(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">
            Please log in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Admin Access Required
          </h1>
          <p className="text-red-700">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900 font-semibold">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-red-700 text-lg">
              Manage users and platform analytics
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Users List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  All Users
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => loadUserDetails(user._id)}
                      className="p-4 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      <h3 className="font-semibold text-amber-900">
                        {user.name}
                      </h3>
                      <p className="text-red-700 text-sm">{user.email}</p>
                      <p className="text-amber-700 text-xs">
                        Role: {user.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  User Details
                </h2>

                {selectedUser ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">
                            Name
                          </label>
                          <p className="text-red-700">{selectedUser.name}</p>
                        </div>
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">
                            Email
                          </label>
                          <p className="text-red-700">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">
                            Role
                          </label>
                          <p className="text-red-700">{selectedUser.role}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">
                            Channel Link
                          </label>
                          <p className="text-red-700">
                            {selectedUser.channelLink || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">
                            User ID
                          </label>
                          <p className="text-red-700 text-sm font-mono">
                            {selectedUser._id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <h3 className="text-lg font-bold text-amber-900">
                          {selectedUser.previousData?.length || 0}
                        </h3>
                        <p className="text-red-700 text-sm">
                          Previous Data Entries
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <h3 className="text-lg font-bold text-amber-900">
                          {selectedUser.commentsData?.length || 0}
                        </h3>
                        <p className="text-red-700 text-sm">Comment Sessions</p>
                      </div>
                      <div className="bg-amber-100 p-4 rounded-lg text-center">
                        <h3 className="text-lg font-bold text-amber-900">
                          {selectedUser.oauthData?.googleId
                            ? "Connected"
                            : "Not Connected"}
                        </h3>
                        <p className="text-red-700 text-sm">Google OAuth</p>
                      </div>
                    </div>

                    {/* Comments Data */}
                    {selectedUser.commentsData &&
                      selectedUser.commentsData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900 mb-4">
                            Recent Comment Activity
                          </h3>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {selectedUser.commentsData
                              .slice(0, 5)
                              .map((session, index) => (
                                <div
                                  key={index}
                                  className="bg-amber-50 p-3 rounded"
                                >
                                  <p className="text-amber-900 font-semibold">
                                    Video ID: {session.videoId}
                                  </p>
                                  <p className="text-red-700 text-sm">
                                    Replied to {session.repliedCount} comments
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* OAuth Data */}
                    {selectedUser.oauthData &&
                      Object.keys(selectedUser.oauthData).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900 mb-4">
                            OAuth Information
                          </h3>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-amber-900">
                              <strong>Google ID:</strong>{" "}
                              {selectedUser.oauthData.googleId}
                            </p>
                            <p className="text-amber-900">
                              <strong>OAuth Email:</strong>{" "}
                              {selectedUser.oauthData.email}
                            </p>
                            <p className="text-amber-900">
                              <strong>Name:</strong>{" "}
                              {selectedUser.oauthData.name}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Raw Data */}
                    <details className="mt-6">
                      <summary className="text-amber-900 font-semibold cursor-pointer">
                        View Raw Data
                      </summary>
                      <pre className="bg-gray-100 p-4 rounded-lg mt-2 text-xs overflow-auto max-h-64">
                        {JSON.stringify(selectedUser, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-red-700 text-center py-8">
                    Select a user from the list to view their details
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">
              Platform Statistics
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-900">
                  {users.length}
                </h3>
                <p className="text-red-700">Total Users</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-900">
                  {users.filter((u) => u.role === "admin").length}
                </h3>
                <p className="text-red-700">Admins</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-900">
                  {
                    users.filter(
                      (u) => u.oauthData && Object.keys(u.oauthData).length > 0
                    ).length
                  }
                </h3>
                <p className="text-red-700">OAuth Connected</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-amber-900">
                  {users.filter((u) => u.channelLink).length}
                </h3>
                <p className="text-red-700">With Channel Links</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
