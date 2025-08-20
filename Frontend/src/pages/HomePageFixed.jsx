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
    const handleOAuthMessage = (event) => {
      if (event.origin !== "http://localhost:5000") return;

      if (event.data.type === "oauth_success") {
        const oauthData = event.data.data;
        localStorage.setItem("youtube_oauth_data", JSON.stringify(oauthData));
        setOauthMessage("YouTube account connected successfully!");
        setIsYouTubeConnected(true);
        setTimeout(() => setOauthMessage(""), 3000);

        if (oauthData.channels) {
          setUserChannels(oauthData.channels);
        }
      } else if (event.data.type === "oauth_error") {
        setOauthMessage(`Failed to connect YouTube: ${event.data.error}`);
        setTimeout(() => setOauthMessage(""), 5000);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

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
                              <p className="font-medium text-amber-900">
                                {channel.channelTitle}
                              </p>
                              <p className="text-sm text-gray-600">
                                {parseInt(
                                  channel.subscriberCount
                                ).toLocaleString()}{" "}
                                subscribers
                              </p>
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
                      onClick={() => {
                        setLoading(true);
                        setOauthMessage("Opening OAuth popup...");

                        const popup = window.open(
                          "http://localhost:5000/oauth/google",
                          "oauth_popup",
                          "width=500,height=600,scrollbars=yes,resizable=yes"
                        );

                        if (!popup) {
                          setOauthMessage(
                            "Popup blocked. Please allow popups and try again."
                          );
                          setLoading(false);
                          return;
                        }

                        const timeout = setTimeout(() => {
                          if (!popup.closed) {
                            popup.close();
                            setOauthMessage(
                              "OAuth timed out. Please try again."
                            );
                            setLoading(false);
                          }
                        }, 60000);

                        const checkClosed = setInterval(() => {
                          if (popup.closed) {
                            clearInterval(checkClosed);
                            clearTimeout(timeout);
                            setLoading(false);
                          }
                        }, 1000);
                      }}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Connecting..." : "Connect YouTube Account"}
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
