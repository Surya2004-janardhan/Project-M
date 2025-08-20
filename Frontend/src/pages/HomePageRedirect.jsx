import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

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

    // Check existing connection
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
  }, []);

  const handleYouTubeConnect = () => {
    setLoading(true);
    setOauthMessage("Redirecting to YouTube authentication...");
    window.location.href = "http://localhost:5000/oauth/google";
  };

  return (
    <div className="py-8">
      <div className="px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Welcome to YouTube Manager
          </h1>

          {oauthMessage && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                oauthMessage.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {oauthMessage}
            </div>
          )}

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
                              key={channel.channelId}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {channel.channelThumbnail && (
                                  <img
                                    src={channel.channelThumbnail}
                                    alt={channel.channelTitle}
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-amber-900">
                                    {channel.channelTitle}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {parseInt(
                                      channel.subscriberCount
                                    ).toLocaleString()}{" "}
                                    subscribers •{" "}
                                    {parseInt(
                                      channel.videoCount
                                    ).toLocaleString()}{" "}
                                    videos
                                  </p>
                                </div>
                                <a
                                  href={channel.channelUrl}
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
    </div>
  );
}
