import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { tokenManager, youtubeAPI } from "../api/api";
import OAuthHandler from "../components/OAuthHandler";
import YouTubeOAuthHandler, {
  isYouTubeConnected,
  getYouTubeUserInfo,
} from "../components/YouTubeOAuthHandler";

export default function HomePage() {
  const { user } = useAuth();
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthMessage, setOauthMessage] = useState("");
  const [userChannels, setUserChannels] = useState([]);

  useEffect(() => {
    // Check for OAuth redirect parameters
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get("oauth_success");
    const oauthData = urlParams.get("oauth_data");
    const oauthError = urlParams.get("oauth_error");

    if (oauthSuccess === "true" && oauthData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(oauthData));
        localStorage.setItem("youtube_oauth_data", JSON.stringify(parsedData));
        setOauthMessage("YouTube account connected successfully!");
        setIsYouTubeConnected(true);

        if (parsedData.channels) {
          setUserChannels(parsedData.channels);
        }

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        setTimeout(() => setOauthMessage(""), 3000);
      } catch (error) {
        console.error("Error processing OAuth:", error);
        setOauthMessage("Error processing YouTube connection");
        setTimeout(() => setOauthMessage(""), 5000);
      }
    } else if (oauthError) {
      setOauthMessage(`Failed to connect YouTube: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setOauthMessage(""), 5000);
    }

    // Check existing connection only if user is logged in
    if (user) {
      const storedOAuthData = localStorage.getItem("youtube_oauth_data");
      if (storedOAuthData && !oauthSuccess) {
        try {
          const parsedData = JSON.parse(storedOAuthData);
          setIsYouTubeConnected(true);
          if (parsedData.channels) {
            setUserChannels(parsedData.channels);
          }
        } catch (error) {
          console.log(error.message);
          localStorage.removeItem("youtube_oauth_data");
        }
      }

      const checkYouTubeConnection = () => {
        const connected = tokenManager.isYouTubeConnected();
        setIsYouTubeConnected(connected);

        if (connected) {
          const userInfo = localStorage.getItem("youtubeUserInfo");
          if (userInfo) {
            const userData = JSON.parse(userInfo);
            setOauthMessage(`Connected as ${userData.name || userData.email}`);
          } else {
            setOauthMessage("YouTube account connected");
          }
        }
      };

      checkYouTubeConnection();
    } else {
      // If user is not logged in, clear YouTube connection state
      setIsYouTubeConnected(false);
      setUserChannels([]);
      setOauthMessage("");
    }
  }, [user]); // Added user dependency

  const handleYouTubeConnect = () => {
    setLoading(true);
    setOauthMessage("Redirecting to YouTube authentication...");
    window.location.href = "http://localhost:5000/oauth/google";
  };

  const handleOAuthComplete = async (result) => {
    if (result.success) {
      setIsYouTubeConnected(true);
      setOauthMessage(result.message);
      if (result.userInfo) {
        setOauthMessage(
          `Connected as ${result.userInfo.name || result.userInfo.email}`
        );
      }

      // Fetch user channels after successful OAuth
      await fetchUserChannels();
    } else {
      setOauthMessage(result.message);
    }

    // Clear message after 5 seconds
    setTimeout(() => setOauthMessage(""), 5000);
  };

  // Function to fetch user's YouTube channels
  const fetchUserChannels = async () => {
    try {
      console.log("🔍 Fetching user channels...");
      const result = await youtubeAPI.getUserChannels();

      if (result.success && result.data) {
        console.log("✅ Channels fetched:", result.data.length);
        setUserChannels(result.data);
      } else {
        console.log("❌ Failed to fetch channels:", result.message);
        setUserChannels([]);
      }
    } catch (error) {
      console.error("❌ Error fetching channels:", error);
      setUserChannels([]);
    }
  };

  return (
    <div className="py-8">
      <div className="px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Welcome to YouTube Manager
          </h1>
          {/* YouTube OAuth Handler - handles callback processing */}
          <YouTubeOAuthHandler onOAuthComplete={handleOAuthComplete} />{" "}
          {/* OAuth Status Message */}
          {oauthMessage && (
            <div className="fixed top-4 right-4 z-50">
              <div
                className={`px-4 py-2 rounded-lg shadow-lg ${
                  isYouTubeConnected
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {oauthMessage}
              </div>
            </div>
          )}
          {/* YouTube Connection Status in Hero Section */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isYouTubeConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isYouTubeConnected ? "bg-green-500" : "bg-amber-500"
                }`}
              ></span>
              {isYouTubeConnected
                ? "YouTube Connected"
                : "YouTube Not Connected"}
            </div>
          </div>
          {user ? (
            <div>
              <p className="text-red-700 text-lg mb-8">
                Welcome back, {user.name}!
              </p>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">
                  YouTube Account Connection
                </h3>
                {isYouTubeConnected ? (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-green-600 justify-center mb-4">
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
                      <span className="font-semibold">
                        Connected to YouTube
                      </span>
                    </div>
                    {userChannels.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-lg font-medium text-amber-800 mb-2">
                          Your Channels:
                        </h4>
                        <div className="space-y-2">
                          {userChannels.map((channel) => (
                            <div
                              key={channel.id}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {channel.snippet.thumbnails?.default?.url && (
                                  <img
                                    src={channel.snippet.thumbnails.default.url}
                                    alt={channel.snippet.title}
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-amber-900">
                                    {channel.snippet.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {parseInt(
                                      channel.statistics.subscriberCount || 0
                                    ).toLocaleString()}{" "}
                                    subscribers •{" "}
                                    {parseInt(
                                      channel.statistics.videoCount || 0
                                    ).toLocaleString()}{" "}
                                    videos •{" "}
                                    {parseInt(
                                      channel.statistics.viewCount || 0
                                    ).toLocaleString()}{" "}
                                    views
                                  </p>
                                </div>
                                <a
                                  href={`https://www.youtube.com/channel/${channel.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  View Channel
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={fetchUserChannels}
                          className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
                        >
                          Refresh Channels
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-red-700 mb-4">
                      Connect your YouTube account to enable features
                    </p>
                    <button
                      onClick={handleYouTubeConnect}
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

              <Link
                to="/youtube"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
              >
                Manage YouTube
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xl text-red-700 mb-8">
                Please log in to access YouTube features.
              </p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="bg-red-800 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-red-800 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Section - Remove in production */}
      <div className="fixed bottom-4 right-4 bg-gray-100 p-4 rounded-lg text-xs">
        <div>YouTube Connected: {isYouTubeConnected ? "✅" : "❌"}</div>
        <div>
          Access Token: {tokenManager.getYouTubeAccessToken() ? "✅" : "❌"}
        </div>
        <div>
          Refresh Token: {tokenManager.getYouTubeRefreshToken() ? "✅" : "❌"}
        </div>
        <div>
          yt_access_token:{" "}
          {localStorage.getItem("yt_access_token") ? "✅" : "❌"}
        </div>
        <button
          onClick={() => {
            console.log("🔍 Manual connection check...");
            tokenManager.debugYouTubeStorage();
            setIsYouTubeConnected(tokenManager.isYouTubeConnected());
          }}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Refresh Status
        </button>
        <button
          onClick={() => {
            console.log("🧹 Manual clear tokens...");
            tokenManager.clearAll();
            setIsYouTubeConnected(false);
            setUserChannels([]);
            setOauthMessage("");
          }}
          className="mt-2 ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
        >
          Clear All Tokens
        </button>
      </div>
    </div>
  );
}
