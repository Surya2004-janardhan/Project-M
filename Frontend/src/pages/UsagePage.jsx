import React from "react";
import { useAuth } from "../store/AuthContext";

export default function UsagePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">
            Please log in to view your usage statistics.
          </p>
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
              Usage Statistics
            </h1>
            <p className="text-red-700 text-lg">
              Monitor your account usage and activity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">0</h3>
              <p className="text-red-700">Total Sessions</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">0h</h3>
              <p className="text-red-700">Time Spent</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">0</h3>
              <p className="text-red-700">Actions Performed</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-900">100%</h3>
              <p className="text-red-700">Satisfaction</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-6">
                Activity Timeline
              </h3>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <div className="w-3 h-3 bg-amber-900 rounded-full mr-4"></div>
                  <div>
                    <p className="text-amber-900 font-semibold">
                      Account Created
                    </p>
                    <p className="text-red-700 text-sm">
                      Welcome to the platform!
                    </p>
                  </div>
                  <span className="ml-auto text-red-700 text-sm">Today</span>
                </div>

                <div className="flex items-center p-4 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 bg-red-800 rounded-full mr-4"></div>
                  <div>
                    <p className="text-amber-900 font-semibold">First Login</p>
                    <p className="text-red-700 text-sm">
                      Successfully logged in
                    </p>
                  </div>
                  <span className="ml-auto text-red-700 text-sm">Today</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-6">
                Usage Insights
              </h3>

              <div className="space-y-4">
                <div className="p-4 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Most Active Day
                  </h4>
                  <p className="text-red-700">
                    Today - You're just getting started!
                  </p>
                </div>

                <div className="p-4 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Peak Usage Time
                  </h4>
                  <p className="text-red-700">Now - Current session active</p>
                </div>

                <div className="p-4 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Favorite Feature
                  </h4>
                  <p className="text-red-700">
                    Dashboard - Most visited section
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
