import React from "react";
import "../App.css";

const WelcomeScreen = ({ title, subtitle, buttonText, onStart }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">{title}</h1>
        <p className="welcome-subtitle">{subtitle}</p>
        <button className="welcome-button" onClick={onStart}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
