import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { oauthAPI, userAPI, tokenManager } from "../api/api";

export default function HomePage() {
  const { user } = useAuth();
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [oauthMessage, setOauthMessage] = useState("");

  useEffect(() => {
    if (user) {
      checkYouTubeConnection();
      handleOAuthCallback();
    }
  }, [user]);

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthStatus = urlParams.get("oauth");
    const oauthData = urlParams.get("data");
    const errorMessage = urlParams.get("message");

    if (oauthStatus === "success" && oauthData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(oauthData));
        setOauthMessage("Connecting your YouTube account...");
        // Associate OAuth data with current user
        associateOAuthWithUser(parsedData);
        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Error parsing OAuth data:", error);
        setOauthMessage("Error connecting YouTube account");
      }
    } else if (oauthStatus === "error") {
      console.error("OAuth error:", errorMessage);
      setOauthMessage("Failed to connect YouTube account");
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const associateOAuthWithUser = async (oauthData) => {
    try {
      const result = await oauthAPI.associateOAuthData(oauthData);
      if (result.message) {
        setIsYouTubeConnected(true);
        setOauthMessage("YouTube account connected successfully!");
        setTimeout(() => setOauthMessage(""), 3000);
        // Refresh user profile
        checkYouTubeConnection();
      }
    } catch (error) {
      console.error("Error associating OAuth data:", error);
      setOauthMessage("Error connecting YouTube account");
    }
  };

  const checkYouTubeConnection = async () => {
    try {
      const userId = tokenManager.getUserId();
      if (userId) {
        const result = await userAPI.getUserData(userId);
        if (result.success) {
          setUserProfile(result.data);
          // Check if user has OAuth data indicating YouTube connection
          setIsYouTubeConnected(
            result.data.oauthData &&
              Object.keys(result.data.oauthData).length > 0 &&
              result.data.oauthData.googleId
          );
        }
      }
    } catch (error) {
      console.error("Error checking YouTube connection:", error);
    }
  };

  const handleConnectYouTube = () => {
    setLoading(true);
    // Redirect to OAuth endpoint
    oauthAPI.initiateGoogleOAuth();
  };

  return (
    <div className="py-8">
      <div className="px-6">
        {user ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Welcome back, {user.name}!
            </h1>
            <p className="text-red-700 text-lg mb-8">
              Manage your YouTube channels and automate comment replies with AI.
            </p>

            {/* OAuth Status Message */}
            {oauthMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  oauthMessage.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : oauthMessage.includes("Error") ||
                      oauthMessage.includes("Failed")
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {oauthMessage}
              </div>
            )}

            {/* YouTube OAuth Connection Status */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">
                YouTube Account Connection
              </h3>
              <div className="flex items-center justify-center gap-4">
                {isYouTubeConnected ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-semibold">Connected to YouTube</span>
                    {userProfile?.oauthData?.email && (
                      <span className="text-sm text-gray-600">
                        ({userProfile.oauthData.email})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-red-700 mb-4">
                      Connect your YouTube account to enable advanced features
                    </p>
                    <button
                      onClick={handleConnectYouTube}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      )}
                      Connect YouTube Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-amber-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-amber-900">
                    YouTube Management
                  </h3>
                  {isYouTubeConnected && (
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-red-700 mb-4">
                  {isYouTubeConnected
                    ? "Analyze channels, videos, and manage comments with full access"
                    : "Connect YouTube to unlock channel and video analysis"}
                </p>
                <Link
                  to="/youtube"
                  className={`px-4 py-2 rounded transition-colors inline-block text-white ${
                    isYouTubeConnected
                      ? "bg-amber-900 hover:bg-amber-800"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {isYouTubeConnected ? "Manage YouTube" : "Setup Required"}
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
                className="bg-red-800 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
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
