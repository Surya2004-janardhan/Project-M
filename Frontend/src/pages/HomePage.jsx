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
              You're successfully logged in to your account.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-amber-900">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  My Content
                </h3>
                <p className="text-red-700 mb-4">
                  Manage and view your content
                </p>
                <Link
                  to="/content"
                  className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  View Content
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-800">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Usage Stats
                </h3>
                <p className="text-red-700 mb-4">Check your usage statistics</p>
                <Link
                  to="/usage"
                  className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  View Usage
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-amber-700">
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Profile
                </h3>
                <p className="text-red-700 mb-4">
                  Update your profile settings
                </p>
                <Link
                  to="/profile"
                  className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors inline-block"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Welcome to Our Platform
            </h1>
            <p className="text-xl text-red-700 mb-8 max-w-2xl mx-auto">
              Experience the best service with our secure and user-friendly
              platform. Join thousands of satisfied users today.
            </p>

            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-amber-900 hover:bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
              >
                Get Started
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
                  <div className="w-8 h-8 bg-amber-900 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Secure
                </h3>
                <p className="text-red-700">
                  Your data is protected with industry-standard security
                  measures.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-red-800 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Fast
                </h3>
                <p className="text-red-700">
                  Lightning-fast performance for all your needs.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-amber-700 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-3">
                  Reliable
                </h3>
                <p className="text-red-700">
                  99.9% uptime guarantee for uninterrupted service.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
