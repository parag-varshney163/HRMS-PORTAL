// // src/components/DashboardCard.jsx
// import React from "react";
// const DashboardCard = ({
//   title,
//   highlight,
//   value,
//   trendIcon,
//   trendText,
//   trendColor,
//   noSpace = false,
//   width = 260,
// }) => {
//   return (
//     <div
//       className="rounded-2xl p-5 shadow-md flex flex-col items-center justify-center text-center bg-card border border-card-border h-32.5"
//       style={{ width }}
//     >
//       {/* TITLE */}
//       <h2 className="text-lg font-medium text-text-secondary">
//         {title}
//         {!noSpace && " "}
//         <span className="text-accent">{highlight}</span>
//       </h2>
//       {/* MAIN VALUE */}
//       <div className="text-2xl font-semibold mt-3 text-text-primary">
//         {value}
//       </div>
//       {/* TREND SECTION */}
//       <div
//         className="flex items-center gap-1 mt-3 text-sm justify-center"
//         style={{ color: trendColor }}
//       >
//         {trendIcon}
//         <span>{trendText}</span>
//       </div>
//     </div>
//   );
// };
// export default DashboardCard;
// src/components/ui/DashboardCard.jsx
import React from "react";

import colors from "../../constants/colors";


const DashboardCard = ({
  title,
  highlight,
  value,
  trendIcon,
  trendText,
  trendColor,
  backgroundColor,
  iconBg,
  noSpace = false,
  width = "100%",
}) => {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 h-32.5"
      style={{
        width,
        backgroundColor: backgroundColor || colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* ICON BOX */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: iconBg || colors.accent,
          color: "#FFFFFF",
        }}
      >
        {trendIcon}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-center min-w-0">
        <h2
          className="text-sm font-semibold leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {title}
          {!noSpace && " "}
          <span style={{ color: colors.textPrimary }}>{highlight}</span>
        </h2>

        <div
          className="text-2xl font-bold mt-1"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </div>

        <div
          className="flex items-center gap-1 mt-1 text-xs font-medium"
          style={{ color: trendColor || colors.success }}
        >
          <span>{trendText}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
