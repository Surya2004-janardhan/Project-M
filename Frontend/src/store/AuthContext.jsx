import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Simple JWT decode function
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Check localStorage token on app start/reload
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = decodeToken(token);

      if (decoded && decoded.exp && Date.now() < decoded.exp * 1000) {
        // Token exists and is not expired
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name || decoded.email, // fallback to email if no name
        });
      } else {
        // Token expired or invalid, remove it
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // Store token in localStorage
        localStorage.setItem("token", result.token);

        // Decode token and set user
        const decoded = decodeToken(result.token);
        if (decoded) {
          setUser({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          });
        }

        return { success: true };
      } else {
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

      const response = await fetch("http://localhost:5000/singup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, channelLink, email, password }),
      });

      const result = await response.json();

      if (response.ok && result.message === "Account created successfully") {
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Network error - please try again" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("youtube_oauth_data");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  // Show loading spinner during token check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
