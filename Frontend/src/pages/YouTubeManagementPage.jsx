import React, { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { youtubeAPI, oauthAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

// Helper function to format numbers
const formatNumber = (num) => {
  const number = parseInt(num || 0);
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + "B";
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  }
  return number.toLocaleString();
};

export default function YouTubeManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [channelData, setChannelData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const [formData, setFormData] = useState({
    channelLink: "",
    videoLink: "",
    videoContext: "",
    transcript: "",
    comment: "",
    preference: "all",
  });

  // Check OAuth connection status on component mount
  useEffect(() => {
    const checkYouTubeConnection = async () => {
      setCheckingConnection(true);
      try {
        console.log("Checking YouTube connection...");
        const response = await youtubeAPI.checkOAuthStatus();
        console.log("OAuth status response:", response);

        if (response.success) {
          setIsYouTubeConnected(response.data.isConnected);
          console.log("YouTube connected:", response.data.isConnected);
        } else {
          setIsYouTubeConnected(false);
          console.log("OAuth check failed:", response.message);
        }
      } catch (error) {
        console.error("Failed to check OAuth status:", error);
        setIsYouTubeConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    if (user) {
      checkYouTubeConnection();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">
            Please log in to access YouTube management.
          </p>
        </div>
      </div>
    );
  }

  const handleChannelAnalysis = async () => {
    if (!formData.channelLink) {
      setError("Please enter a YouTube channel link");
      return;
    }

    console.log("🚀 Starting channel analysis...", {
      channelLink: formData.channelLink,
      isYouTubeConnected,
      hasUser: !!user,
    });

    // Check if YouTube OAuth is connected
    if (!isYouTubeConnected) {
      setError("Please connect your YouTube account first");
      setTimeout(() => {
        navigate("/", {
          state: {
            message:
              "Please connect your YouTube account to use channel analysis features",
          },
        });
      }, 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔍 Calling analyzeChannelWithOAuth...");
      // Use OAuth-authenticated channel analysis
      const channelDataResult = await youtubeAPI.analyzeChannelWithOAuth(
        formData.channelLink
      );

      console.log("📊 Analysis result received:", {
        success: channelDataResult.success,
        hasData: !!channelDataResult.data,
        message: channelDataResult.message,
        error: channelDataResult.error,
      });

      if (channelDataResult.success) {
        console.log("✅ Setting channel data and switching to channel tab");
        setChannelData(channelDataResult.data);
        setActiveTab("channel");
      } else {
        console.error("❌ Analysis failed:", channelDataResult.message);
        setError(channelDataResult.message || "Failed to analyze channel");
      }
    } catch (err) {
      console.error("❌ Channel analysis error:", err);
      setError(
        "Failed to analyze channel. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVideoAnalysis = async () => {
    if (!formData.videoLink) {
      setError("Please enter a YouTube video link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get video ID
      const videoIdResult = await youtubeAPI.getVideoId(formData.videoLink);
      if (!videoIdResult.success) {
        setError(videoIdResult.message);
        return;
      }

      // Get video data
      const videoDataResult = await youtubeAPI.getVideoData(
        videoIdResult.data.videoId
      );
      if (videoDataResult.success) {
        setVideoData(videoDataResult.data);
        setActiveTab("video");
      } else {
        setError(videoDataResult.message);
      }
    } catch (err) {
      console.log(err.message);
      setError("Failed to analyze video");
    } finally {
      setLoading(false);
    }
  };

  const handleGetComments = async () => {
    if (!videoData?.items?.[0]?.id) {
      setError("Please analyze a video first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const commentsResult = await youtubeAPI.getComments(
        videoData.items[0].id,
        formData.preference
      );
      if (commentsResult.success) {
        setComments(commentsResult.data.commentsData || []);
        setActiveTab("comments");
      } else {
        setError(commentsResult.message);
      }
    } catch (err) {
      console.log(err.message);
      setError("Failed to get comments");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!formData.videoContext || !formData.transcript || !formData.comment) {
      setError("Please fill all fields for AI reply generation");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const replyResult = await youtubeAPI.getLLMReply(
        formData.videoContext,
        formData.transcript,
        formData.comment
      );
      if (replyResult.success) {
        setActiveTab("ai-reply");
        // Store the reply in state or display it
      } else {
        setError(replyResult.message);
      }
    } catch (err) {
      console.log(err.message);
      setError("Failed to generate reply");
    } finally {
      setLoading(false);
    }
  };

  // const handleOAuthConnect = () => {
  //   oauthAPI.initiateGoogleOAuth();
  // };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const TabButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-amber-900 text-white"
          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              YouTube Management
            </h1>
            <p className="text-red-700 text-lg">
              Manage your YouTube channels, videos, and comments
            </p>

            {/* OAuth Connection Status */}
            <div className="mt-4">
              {checkingConnection ? (
                <div className="text-amber-700">
                  Checking YouTube connection...
                </div>
              ) : (
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    isYouTubeConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isYouTubeConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {isYouTubeConnected
                    ? "YouTube Connected"
                    : "YouTube Not Connected"}
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <TabButton
              tabKey="overview"
              label="Overview"
              isActive={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              tabKey="channel"
              label="Channel Analysis"
              isActive={activeTab === "channel"}
              onClick={() => setActiveTab("channel")}
            />
            <TabButton
              tabKey="video"
              label="Video Analysis"
              isActive={activeTab === "video"}
              onClick={() => setActiveTab("video")}
            />
            <TabButton
              tabKey="comments"
              label="Comments"
              isActive={activeTab === "comments"}
              onClick={() => setActiveTab("comments")}
            />
            <TabButton
              tabKey="ai-reply"
              label="AI Replies"
              isActive={activeTab === "ai-reply"}
              onClick={() => setActiveTab("ai-reply")}
            />
            {/* <TabButton
              tabKey="oauth"
              label="Connect YouTube"
              isActive={activeTab === "oauth"}
              onClick={() => setActiveTab("oauth")}
            /> */}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  Quick Actions
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Channel Analysis
                    </h3>
                    <input
                      type="url"
                      name="channelLink"
                      value={formData.channelLink}
                      onChange={handleInputChange}
                      placeholder="Enter YouTube channel link"
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleChannelAnalysis}
                      disabled={loading}
                      className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Analyzing..." : "Analyze Channel"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Video Analysis
                    </h3>
                    <input
                      type="url"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleInputChange}
                      placeholder="Enter YouTube video link"
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleVideoAnalysis}
                      disabled={loading}
                      className="w-full bg-red-800 hover:bg-red-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Analyzing..." : "Analyze Video"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "channel" && channelData && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  Channel Analysis Results
                </h2>

                {/* Channel Header */}
                <div className="bg-gradient-to-r from-amber-50 to-red-50 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    {channelData.thumbnails?.high && (
                      <img
                        src={channelData.thumbnails.high}
                        alt={channelData.title}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-900 mb-2">
                        {channelData.title}
                      </h3>
                      <p className="text-red-700 text-sm mb-2">
                        {channelData.customUrl &&
                          `@${channelData.customUrl.replace(/^@/, "")}`}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-amber-800">
                        <span>📺 Channel ID: {channelData.id}</span>
                        {channelData.country && (
                          <span>🌍 {channelData.country}</span>
                        )}
                        <span>
                          📅 Since{" "}
                          {new Date(
                            channelData.publishedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <a
                        href={channelData.urls?.channel}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        View Channel
                      </a>
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {channelData.formatted?.subscriberCountText ||
                        channelData.statistics?.subscriberCount?.toLocaleString()}
                    </div>
                    <div className="text-green-600 text-sm">Subscribers</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {channelData.formatted?.videoCountText ||
                        channelData.statistics?.videoCount?.toLocaleString()}
                    </div>
                    <div className="text-blue-600 text-sm">Videos</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {channelData.formatted?.viewCountText ||
                        channelData.statistics?.viewCount?.toLocaleString()}
                    </div>
                    <div className="text-purple-600 text-sm">Total Views</div>
                  </div>
                </div>

                {/* Channel Description */}
                {channelData.description && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Description
                    </h4>
                    <p className="text-red-700 text-sm leading-relaxed">
                      {channelData.description.substring(0, 500)}
                      {channelData.description.length > 500 && "..."}
                    </p>
                  </div>
                )}

                {/* Channel Analysis */}
                {channelData.analysis && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-4">
                      Channel Analysis
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">
                          Performance Metrics
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            Channel Age:{" "}
                            <span className="font-medium">
                              {channelData.formatted?.channelAge}
                            </span>
                          </div>
                          <div>
                            Avg Views/Video:{" "}
                            <span className="font-medium">
                              {channelData.analysis.averageViewsPerVideo?.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            Engagement:{" "}
                            <span className="font-medium">
                              {channelData.analysis.subscriberEngagement}
                            </span>
                          </div>
                          <div>
                            Upload Frequency:{" "}
                            <span className="font-medium">
                              {channelData.analysis.contentFrequency}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">
                          Channel Strengths
                        </h5>
                        <ul className="text-sm space-y-1">
                          {channelData.analysis.channelPerformance?.map(
                            (strength, index) => (
                              <li key={index} className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Channel Ownership Badge */}
                {channelData.isOwnChannel && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        Verified: This is your channel
                      </span>
                    </div>
                  </div>
                )}

                {/* Raw Data Toggle */}
                <details className="bg-gray-50 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    View Raw Data (For Developers)
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(channelData, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {activeTab === "video" && videoData && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  Video Data
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={handleGetComments}
                    className="bg-amber-900 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Get Comments
                  </button>
                  <select
                    name="preference"
                    value={formData.preference}
                    onChange={handleInputChange}
                    className="ml-4 px-4 py-2 border border-amber-200 rounded-lg"
                  >
                    <option value="all">All Comments</option>
                    <option value="likes">By Likes</option>
                    <option value="recent">Recent</option>
                  </select>
                </div>
                <pre className="bg-red-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(videoData, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  Comments Management
                </h2>
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <div key={index} className="bg-amber-50 p-4 rounded-lg">
                        <p className="font-semibold text-amber-900">
                          {comment.author}
                        </p>
                        <p className="text-red-700 mb-2">{comment.text}</p>
                        <p className="text-sm text-amber-700">
                          Reply: {comment.replyText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-700">
                    No comments to display. Analyze a video first.
                  </p>
                )}
              </div>
            )}

            {activeTab === "ai-reply" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  AI Reply Generator
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Video Context
                    </label>
                    <textarea
                      name="videoContext"
                      value={formData.videoContext}
                      onChange={handleInputChange}
                      placeholder="Describe the video content..."
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Transcript
                    </label>
                    <textarea
                      name="transcript"
                      value={formData.transcript}
                      onChange={handleInputChange}
                      placeholder="Video transcript..."
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Comment to Reply To
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="The comment you want to reply to..."
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg h-20"
                    />
                  </div>
                  <button
                    onClick={handleGenerateReply}
                    disabled={loading}
                    className="bg-amber-900 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? "Generating..." : "Generate AI Reply"}
                  </button>
                </div>
              </div>
            )}

            {/* {activeTab === "oauth" && (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-semibold text-amber-900 mb-6">
                  Connect Your YouTube Account
                </h2>
                <p className="text-red-700 mb-6">
                  Connect your YouTube account to enable advanced features like
                  posting replies and accessing private data.
                </p>
                <button
                  onClick={handleOAuthConnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-semibold"
                >
                  Connect with Google/YouTube
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
