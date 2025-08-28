import React from "react";
import { useAuth } from "../store/AuthContext";

export default function ContentPage() {
  const { user } = useAuth();

  // Effect to verify authentication state on page load/refresh
  React.useEffect(() => {
    // Check localStorage directly
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    console.log("🔍 ContentPage auth check:", {
      hasAuthToken: !!authToken,
      hasUserId: !!userId,
      userInState: !!user,
      tokenLength: authToken?.length || 0,
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">Please log in to view your content.</p>
          <div className="mt-4 p-3 bg-white rounded-lg text-sm text-left">
            <p>Auth Debug:</p>
            <p>
              Token in localStorage:{" "}
              {localStorage.getItem("authToken") ? "✅ Present" : "❌ Missing"}
            </p>
            <p>
              UserID in localStorage:{" "}
              {localStorage.getItem("userId") ? "✅ Present" : "❌ Missing"}
            </p>
            <p>User in React state: {user ? "✅ Present" : "❌ Missing"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              My Content
            </h1>
            <p className="text-red-700 text-lg">
              Manage and organize your content
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-amber-900">
                  Content Overview
                </h2>
                <button className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors">
                  + Add New
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-amber-900">0</h3>
                  <p className="text-red-700">Total Items</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-amber-900">0</h3>
                  <p className="text-red-700">Published</p>
                </div>
                <div className="bg-amber-100 p-4 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-amber-900">0</h3>
                  <p className="text-red-700">Drafts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-amber-900 mb-4">
              Recent Content
            </h3>

            <div className="text-center py-12">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-amber-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-amber-900 mb-2">
                No content yet
              </h4>
              <p className="text-red-700 mb-6">
                Start creating your first piece of content
              </p>
              <button className="bg-red-800 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
                Create First Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
