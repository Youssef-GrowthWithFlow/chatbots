import React from "react";
import "../App.css";

const LoadingScreen = ({ title, subtitle }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h2 className="loading-title">{title}</h2>
        <p className="loading-subtitle">{subtitle}</p>

        {/* Placeholder for penguin mascot */}
        <div className="loading-mascot-placeholder">
          <div className="loading-spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
