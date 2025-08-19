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
    if (token && tokenManager.isTokenValid()) {
      authAPI
        .getProfile()
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            tokenManager.removeToken();
          }
        })
        .catch(() => {
          tokenManager.removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      tokenManager.removeToken();
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        tokenManager.setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: `Login failed${error.message}` };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authAPI.register(name, email, password);
      if (data.success) {
        tokenManager.setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: `Registration failed${error.message}` };
    }
  };

  const logout = () => {
    tokenManager.removeToken();
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
