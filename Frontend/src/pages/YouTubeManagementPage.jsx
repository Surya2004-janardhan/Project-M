import React, { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { youtubeAPI, oauthAPI, tokenManager } from "../api/api";

export default function YouTubeManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [channelData, setChannelData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    channelLink: "",
    videoLink: "",
    videoContext: "",
    transcript: "",
    comment: "",
    preference: "all",
  });

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

    setLoading(true);
    setError("");

    try {
      // Get channel ID
      const channelIdResult = await youtubeAPI.getChannelId(
        formData.channelLink
      );
      if (!channelIdResult.success) {
        setError(channelIdResult.message);
        return;
      }

      // Get channel data
      const channelDataResult = await youtubeAPI.getChannelData(
        channelIdResult.data.channelId
      );
      if (channelDataResult.success) {
        setChannelData(channelDataResult.data);
        setActiveTab("channel");
      } else {
        setError(channelDataResult.message);
      }
    } catch (err) {
      setError("Failed to analyze channel");
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
      setError("Failed to generate reply");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    oauthAPI.initiateGoogleOAuth();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const TabButton = ({ tabKey, label, isActive, onClick }) => (
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
            <TabButton
              tabKey="oauth"
              label="Connect YouTube"
              isActive={activeTab === "oauth"}
              onClick={() => setActiveTab("oauth")}
            />
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
                  Channel Data
                </h2>
                <pre className="bg-amber-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(channelData, null, 2)}
                </pre>
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

            {activeTab === "oauth" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
