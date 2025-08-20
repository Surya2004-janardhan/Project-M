import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, tokenManager } from "../api/api";

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

  // Auto-login check on app start or reload
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          console.log("Auto-login: Token found, validating...");

          // Validate token and get user data
          const userId = tokenManager.getUserId();
          if (userId) {
            const response = await fetch(
              `http://localhost:5000/user/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const userData = await response.json();
              console.log("Auto-login successful:", userData.email);
              setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
              });
            } else {
              console.log("Auto-login failed: Invalid token");
              // Token is invalid, remove it
              localStorage.removeItem("token");
              tokenManager.removeToken();
            }
          } else {
            console.log("Auto-login failed: No user ID in token");
            localStorage.removeItem("token");
            tokenManager.removeToken();
          }
        } else {
          console.log("Auto-login: No token found");
        }
      } catch (error) {
        console.error("Auto-login error:", error);
        localStorage.removeItem("token");
        tokenManager.removeToken();
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (response.ok && result.accessToken) {
        // Store access token in localStorage
        localStorage.setItem('accessToken', result.accessToken);
        setUser(result.user);
        console.log('Login successful:', result.user.email);
        return { success: true };
      } else {
        console.log('Login failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error - please try again" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, channelLink, email, password) => {
    try {
      setLoading(true);
      const result = await authAPI.signup(name, channelLink, email, password);
      if (result.message === "Account created successfully") {
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    tokenManager.removeToken();
    localStorage.removeItem("youtube_oauth_data"); // Also clear YouTube tokens
    console.log("User logged out");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  // Show loading spinner during auto-login check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
