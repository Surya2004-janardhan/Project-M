import React from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-slideIn"
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
