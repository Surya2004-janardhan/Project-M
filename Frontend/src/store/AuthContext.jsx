import React, { createContext, useContext, useState, useEffect } from "react";
import { tokenManager } from "../api/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored authentication data on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log("🔍 Checking authentication on page load/refresh...");

        // Get tokens directly from localStorage for maximum reliability
        const storedToken = localStorage.getItem("authToken");
        const storedUserId = localStorage.getItem("userId");

        console.log("💾 Stored auth data check:", {
          hasToken: !!storedToken,
          hasUserId: !!storedUserId,
        });

        if (storedToken && storedUserId) {
          // Set the auth state from localStorage
          setToken(storedToken);
          setUser({ id: storedUserId });
          console.log("✅ Authentication restored from localStorage");

          // Ensure tokens are properly set in tokenManager too (backup)
          tokenManager.setToken(storedToken);
          tokenManager.setUserId(storedUserId);
        } else {
          console.log("ℹ️ No stored authentication data found");
        }
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, authToken) => {
    console.log("🔐 User logging in...", { userId: userData.id });

    // Directly store in localStorage for maximum reliability
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userId", userData.id);

    // Also use tokenManager as a backup
    tokenManager.setToken(authToken);
    tokenManager.setUserId(userData.id);

    // Update React state
    setUser(userData);
    setToken(authToken);

    console.log("✅ Login completed - tokens stored in localStorage and state");
  };

  const logout = () => {
    console.log("🚪 User logging out...");

    // Clear ALL localStorage data - simplest and most complete approach
    localStorage.clear();

    // Reset auth state
    setUser(null);
    setToken(null);

    console.log("✅ Logout completed - ALL data cleared");
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
