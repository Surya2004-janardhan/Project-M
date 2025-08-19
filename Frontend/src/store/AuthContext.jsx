import React, { createContext, useContext, useState, useEffect } from "react";
import { tokenManager, authAPI } from "../api/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenManager.getToken();
    const userId = tokenManager.getUserId();

    if (token && userId && tokenManager.isTokenValid()) {
      authAPI
        .getProfile(userId)
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            tokenManager.removeToken();
            tokenManager.removeUserId();
          }
        })
        .catch(() => {
          tokenManager.removeToken();
          tokenManager.removeUserId();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      tokenManager.removeToken();
      tokenManager.removeUserId();
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        tokenManager.setToken(data.token);
        tokenManager.setUserId(data.user.id);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Login failed" };
    }
  };

  const register = async (name, email, password, channelLink = "") => {
    try {
      const data = await authAPI.register(name, email, password, channelLink);
      if (data.success) {
        if (data.token) {
          tokenManager.setToken(data.token);
          tokenManager.setUserId(data.user.id);
          setUser(data.user);
        }
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Registration failed" };
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    tokenManager.removeUserId();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
