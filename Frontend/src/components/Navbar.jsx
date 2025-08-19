import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <navbar>
        <div className="flex justify-between py-4 items-center w-full h-full text-red-800 px-6">
          <Link
            to="/"
            className="bg-red-800 hover:bg-red-700 p-2 text-white rounded transition-colors"
          >
            YT Manager
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-red-800 hover:bg-red-700 p-2 text-white rounded transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-red-800 hover:bg-red-700 p-2 text-white rounded transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <hr className=" text-amber-950" />
      </navbar>
    );
  }

  return (
    <navbar>
      <div className="flex justify-around py-4 items-center w-full h-full text-red-800">
        <Link
          to="/"
          className="bg-amber-900 p-2 text-white rounded hover:bg-amber-800 transition-colors"
        >
          YT Manager
        </Link>
        <ul className="flex gap-5 font-bold relative">
          <li>
            <Link
              to="/"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/youtube"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/youtube"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              YouTube
            </Link>
          </li>
          <li>
            <Link
              to="/content"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/content"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              Content
            </Link>
          </li>
          <li>
            <Link
              to="/usage"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/usage"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              Usage
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/profile"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className={`cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${
                location.pathname === "/admin"
                  ? "text-white bg-amber-900 shadow-lg"
                  : "text-red-800 hover:text-amber-900 hover:bg-amber-100"
              }`}
            >
              Admin
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          {/* <span className="text-amber-900 font-semibold">
            Welcome, {user.name}
          </span> */}
          <button
            onClick={handleLogout}
            className="bg-amber-900 hover:bg-amber-800 p-2 text-white rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <hr className="text-amber-950" />
    </navbar>
  );
}
