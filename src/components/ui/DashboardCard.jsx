// src/components/DashboardCard.jsx
import React from "react";

const DashboardCard = ({
  title,
  highlight,
  value,
  trendIcon,
  trendText,
  trendColor,
  noSpace = false,
  width = 260,
}) => {
  return (
    <div
      className="rounded-2xl p-5 shadow-md flex flex-col items-center justify-center text-center bg-card border border-card-border h-32.5"
      style={{ width }}
    >
      {/* TITLE */}
      <h2 className="text-lg font-medium text-text-secondary">
        {title}
        {!noSpace && " "}
        <span className="text-accent">{highlight}</span>
      </h2>

      {/* MAIN VALUE */}
      <div className="text-2xl font-semibold mt-3 text-text-primary">
        {value}
      </div>

      {/* TREND SECTION */}
      <div
        className="flex items-center gap-1 mt-3 text-sm justify-center"
        style={{ color: trendColor }}
      >
        {trendIcon}
        <span>{trendText}</span>
      </div>
    </div>
  );
};

export default DashboardCard;
