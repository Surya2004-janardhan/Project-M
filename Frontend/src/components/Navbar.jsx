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
        <div className="flex justify-between mt-2 items-center w-full h-full text-red-800 px-6">
          <Link
            to="/"
            className="bg-amber-900 p-2 text-white rounded hover:bg-amber-800 transition-colors"
          >
            Logo
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-amber-900 hover:bg-amber-800 p-2 text-white rounded transition-colors"
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
        <hr className="mt-5 text-amber-950" />
      </navbar>
    );
  }

  return (
    <navbar>
      <div className="flex justify-around mt-2 items-center w-full h-full text-red-800">
        <Link
          to="/"
          className="bg-amber-900 p-2 text-white rounded hover:bg-amber-800 transition-colors"
        >
          Logo
        </Link>
        <ul className="flex gap-5 font-bold">
          <li>
            <Link
              to="/"
              className={`cursor-pointer hover:text-amber-900 transition-colors ${
                location.pathname === "/" ? "text-amber-900" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/content"
              className={`cursor-pointer hover:text-amber-900 transition-colors ${
                location.pathname === "/content" ? "text-amber-900" : ""
              }`}
            >
              My Content
            </Link>
          </li>
          <li>
            <Link
              to="/usage"
              className={`cursor-pointer hover:text-amber-900 transition-colors ${
                location.pathname === "/usage" ? "text-amber-900" : ""
              }`}
            >
              Usage
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`cursor-pointer hover:text-amber-900 transition-colors ${
                location.pathname === "/profile" ? "text-amber-900" : ""
              }`}
            >
              Profile
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <span className="text-amber-900 font-semibold">
            Welcome, {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-amber-900 hover:bg-amber-800 p-2 text-white rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <hr className="mt-5 text-amber-950" />
    </navbar>
  );
}
