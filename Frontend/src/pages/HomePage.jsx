import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
      <div className="container mx-auto px-6 py-8">
        {user ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-red-700 text-lg mb-8">
              Manage your YouTube channels and automate comment replies with AI.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-amber-900">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  YouTube Management
                </h3>
                <p className="text-red-700 mb-4">
                  Analyze channels, videos, and manage comments
                </p>
                <Link
                  to="/youtube"
                  className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  Manage YouTube
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-800">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Usage Analytics
                </h3>
                <p className="text-red-700 mb-4">
                  Track your comment automation activity
                </p>
                <Link
                  to="/usage"
                  className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  View Analytics
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-amber-700">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Content Library
                </h3>
                <p className="text-red-700 mb-4">
                  Manage your video content and replies
                </p>
                <Link
                  to="/content"
                  className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  View Content
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              YouTube Comment Management Platform
            </h1>
            <p className="text-xl text-red-700 mb-8 max-w-2xl mx-auto">
              Automate your YouTube comment responses with AI-powered replies.
              Manage multiple channels, analyze video performance, and engage
              with your audience efficiently.
            </p>

            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
              >
                Start Managing Comments
              </Link>
              <Link
                to="/login"
                className="bg-red-800 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
              >
                Sign In
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
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
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  AI-Powered Replies
                </h3>
                <p className="text-red-700">
                  Generate contextual comment replies using advanced AI
                  technology.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Automated Workflow
                </h3>
                <p className="text-red-700">
                  Streamline your comment management with automated response
                  systems.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-amber-700"
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
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Analytics & Insights
                </h3>
                <p className="text-red-700">
                  Track engagement metrics and optimize your comment strategy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
